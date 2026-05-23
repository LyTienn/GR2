import os
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine
import json

def main():
    # =========================================================================
    # 1. CẤU HÌNH KẾT NỐI DATABASE
    # =========================================================================
    DB_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/web_20251')
    
    try:
        engine = create_engine(DB_URL)
        print("1. 🔄 Đang kết nối database và tải dữ liệu bình luận...")
        
        # Lấy dữ liệu rating thực tế từ bảng comments công khai
        query = "SELECT user_id, book_id, rating FROM comments WHERE rating IS NOT NULL"
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print("❌ Lỗi: Bảng 'comments' hiện không có dữ liệu rating nào hợp lệ.")
            return
            
        print(f"   -> Đã tải thành công {len(df)} dòng dữ liệu bình luận sạch.")
        
        # =========================================================================
        # 2. XÂY DỰNG MA TRẬN TƯƠNG TÁC (UTILITY MATRIX)
        # =========================================================================
        print("2. ⚙️ Đang xây dựng ma trận tương tác (Sách x Người dùng)...")
        # Hàng: book_id, Cột: user_id, Giá trị: rating. Những chỗ trống điền bằng 0
        matrix = df.pivot_table(index='book_id', columns='user_id', values='rating').fillna(0)
        print(f"   -> Kích thước ma trận: {matrix.shape[0]} sách x {matrix.shape[1]} người dùng.")
        
        # =========================================================================
        # 3. TÍNH TOÁN COSINE SIMILARITY (ITEM-BASED COLLABORATIVE FILTERING)
        # =========================================================================
        print("3. 🧠 Đang tính toán độ tương đồng giữa các cuốn sách bằng Cosine Similarity...")
        item_sim = cosine_similarity(matrix)
        item_sim_df = pd.DataFrame(item_sim, index=matrix.index, columns=matrix.index)
        
        # =========================================================================
        # 4. TRÍCH XUẤT TOP 5 SÁCH TƯƠNG ĐỒNG NHẤT
        # =========================================================================
        print("4. 📊 Đang lọc ra Top 5 sách liên quan nhất cho từng cuốn...")
        recommendations = []
        for book_id in item_sim_df.index:
            # Lấy dòng độ tương đồng của cuốn sách hiện tại, sắp xếp giảm dần từ 1 về 0
            # Chọn [1:6] vì phần tử đầu tiên (vị trí 0) luôn là chính nó (độ tương đồng = 1)
            top_similar = item_sim_df.loc[book_id].sort_values(ascending=False)[1:6]
            
            # Chuyển đổi ID sang kiểu dữ liệu int chuẩn và đóng gói mảng JSON
            similar_ids = [int(b) for b in top_similar.index.tolist()]
            
            recommendations.append({
                'book_id': int(book_id),
                'similar_book_ids': json.dumps(similar_ids) # Lưu dạng chuỗi JSON: "[12, 45, 78, 23, 5]"
            })
            
        result_df = pd.DataFrame(recommendations)
        
        # =========================================================================
        # 5. ĐẨY DỮ LIỆU KẾT QUẢ VÀO DATABASE
        # =========================================================================
        print("5. 💾 Đang lưu kết quả tính toán vào bảng 'book_recommendations'...")
        # if_exists='replace' sẽ tự tạo bảng mới hoặc ghi đè toàn bộ dữ liệu cũ khi train lại
        result_df.to_sql('book_recommendations', engine, if_exists='replace', index=False)
        
        print("✅ THÀNH CÔNG! Bảng 'book_recommendations' đã sẵn sàng phục vụ hệ thống.")
        print("   -> Bây giờ NestJS có thể gọi dữ liệu để hiển thị lên UI.")
        
    except Exception as e:
        print(f"❌ Có lỗi xảy ra trong quá trình xử lý: {str(e)}")

if __name__ == "__main__":
    main()