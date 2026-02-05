# 1. Chọn Base Image (Node v22 Alpine là rất tốt, nhẹ)
FROM node:22-alpine

# 2. Thiết lập thư mục làm việc
WORKDIR /app

# 3. Copy file package trước (Để tận dụng Cache của Docker)
COPY package*.json ./

# 4. Cài đặt thư viện
RUN npm install --only=production

# 5. Copy toàn bộ code
COPY . .

# 6. Mở port (Bạn sửa thành 5000 cho khớp với code BE của bạn)
EXPOSE 5000

# 7. Lệnh chạy
# Lên server ta dùng 'start', không dùng 'dev'
CMD ["npm", "start"]