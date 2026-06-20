import os
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sqlalchemy import create_engine
from dotenv import load_dotenv 
import json

# Tải biến từ .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))  

def main():
    DB_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:1@localhost:5432/web_20251')
    
    # Nếu đang chạy locally (không trong Docker), thay 'db' thành 'localhost'
    if 'db:5432' in DB_URL:
        DB_URL = DB_URL.replace('db:5432', 'localhost:5432')
    
    try:
        engine = create_engine(DB_URL)
        print(f"Kết nối tới: {DB_URL}")
        
        # =========================================================================
        # 2. PHẦN 1: COLLABORATIVE FILTERING (từ Rating)
        # =========================================================================
        print("1. Đang kết nối database và tải dữ liệu rating...")
        
        query_rating = "SELECT user_id, book_id, rating FROM comments WHERE rating IS NOT NULL"
        df_rating = pd.read_sql(query_rating, engine)
        
        if df_rating.empty:
            print(" Lỗi: Không có dữ liệu rating.")
            return
            
        print(f"   -> Đã tải {len(df_rating)} dòng dữ liệu rating.")
        
        # Xây dựng rating matrix
        print("2.  Đang xây dựng ma trận tương tác (Sách x Người dùng)...")
        rating_matrix = df_rating.pivot_table(
            index='book_id', 
            columns='user_id', 
            values='rating'
        ).fillna(0)
        print(f"   -> Kích thước ma trận: {rating_matrix.shape[0]} sách x {rating_matrix.shape[1]} người dùng.")
        
        # Tính CF Similarity
        print("3.  Đang tính Collaborative Filtering Similarity...")
        cf_similarity = cosine_similarity(rating_matrix)
        cf_sim_df = pd.DataFrame(
            cf_similarity, 
            index=rating_matrix.index, 
            columns=rating_matrix.index
        )
        print("   -> CF Similarity tính toán thành công.")
        
        # =========================================================================
        # 3. PHẦN 2: CONTENT-BASED (từ Subject + Author + Summary)
        # =========================================================================
        print("4.  Đang tải dữ liệu nội dung sách (Subject, Author, Summary)...")
        
        query_content = """
            SELECT 
                b.id,
                b.summary,
                a.name as author_name,
                STRING_AGG(DISTINCT s.name, ' ') as subjects
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            LEFT JOIN book_subjects bs ON b.id = bs.book_id
            LEFT JOIN subjects s ON bs.subject_id = s.id
            WHERE b.is_deleted = 0
            GROUP BY b.id, b.summary, a.name
        """
        df_content = pd.read_sql(query_content, engine)
        
        # Tạo text kết hợp từ subject + author + summary
        df_content['combined_text'] = (
            df_content['subjects'].fillna('') + ' ' +
            df_content['author_name'].fillna('') + ' ' +
            df_content['summary'].fillna('')
        )
        
        # Vectorize bằng TF-IDF
        print("5.  Đang vectorize nội dung (TF-IDF)...")
        vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words='english',
            min_df=1,
            max_df=0.95
        )
        content_vectors = vectorizer.fit_transform(df_content['combined_text'])
        
        # Tính Content Similarity
        print("6.  Đang tính Content-based Similarity...")
        content_similarity = cosine_similarity(content_vectors)
        content_sim_df = pd.DataFrame(
            content_similarity,
            index=df_content['id'],
            columns=df_content['id']
        )
        print("   -> Content Similarity tính toán thành công.")
        
        # =========================================================================
        # 4. PHẦN 3: KẾT HỢP (70% CF + 30% Content-based)
        # =========================================================================
        print("7.  Đang kết hợp CF và Content-based...")
        
        # Lấy những sách có cả rating và content
        common_books = cf_sim_df.index.intersection(content_sim_df.index)
        print(f"   -> {len(common_books)} sách có dữ liệu đầy đủ (rating + content).")
        
        # Chuẩn hóa về cùng index
        cf_sim_aligned = cf_sim_df.loc[common_books, common_books].values
        content_sim_aligned = content_sim_df.loc[common_books, common_books].values
        
        # Hybrid: 70% CF + 30% Content-based
        hybrid_similarity = 0.7 * cf_sim_aligned + 0.3 * content_sim_aligned
        hybrid_sim_df = pd.DataFrame(
            hybrid_similarity,
            index=common_books,
            columns=common_books
        )
        print("   -> Hybrid Score = 70% CF + 30% Content-based")
        
        # =========================================================================
        # 5. PHẦN 4: TRÍCH XUẤT TOP 5 SÁCH TƯƠNG ĐỒNG
        # =========================================================================
        print("8.  Đang lọc ra Top 5 sách liên quan nhất cho từng cuốn...")
        recommendations = []
        for book_id in hybrid_sim_df.index:
            # Lấy top 5 sách tương tự (bỏ qua chính nó - vị trí 0)
            top_similar = hybrid_sim_df.loc[book_id].sort_values(ascending=False)[1:6]
            
            similar_ids = [int(b) for b in top_similar.index.tolist()]
            
            recommendations.append({
                'book_id': int(book_id),
                'similar_book_ids': json.dumps(similar_ids)
            })
        
        result_df = pd.DataFrame(recommendations)
        print(f"   -> Đã tạo {len(result_df)} dòng gợi ý.")
        
        # =========================================================================
        # 6. PHẦN 5: LƯU VÀO DATABASE
        # =========================================================================
        print("9.  Đang lưu kết quả vào bảng 'book_recommendations'...")
        result_df.to_sql('book_recommendations', engine, if_exists='replace', index=False)
        
        print(" THÀNH CÔNG!")
        print(f"   -> Đã tạo gợi ý cho {len(result_df)} cuốn sách.")
        print("   -> Bảng 'book_recommendations' sẵn sàng phục vụ hệ thống.")
        print("   -> Backend có thể gọi API để hiển thị gợi ý trên UI.")
        
    except Exception as e:
        print(f" Có lỗi xảy ra: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()