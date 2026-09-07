# 🌿 Sweet Pea Cafe

Website quản lý menu, danh mục và đặt bàn cho Sweet Pea — một góc xanh, một ngày dịu hơn.

Xây dựng bằng **Next.js (React)**, **Tailwind CSS v4**, **Supabase** và **Cloudinary**. Frontend và API cùng chạy trên Vercel để tránh CORS và cold start từ backend miễn phí riêng biệt.

---

## ✨ Tính năng chính

**Menu & sản phẩm**
- Thêm / sửa / xóa món
- Quản lý nhiều size và giá cho mỗi món
- Quản lý nhiều hình ảnh sản phẩm
- Quản lý danh mục, bật / tắt danh mục trên menu

**Nội dung & media**
- Quản lý bản tin (news)
- Upload ảnh/video lên Cloudinary (có chữ ký, API secret không lộ ra trình duyệt)
- Quản lý thông tin quán

**Đặt bàn**
- Tiếp nhận yêu cầu đặt bàn
- Xác nhận / hủy / hoàn tất đặt bàn
- Thông báo khi có khách đặt bàn mới

**Hiệu năng & vận hành**
- Dữ liệu công khai cache 60 giây, `stale-while-revalidate` 5 phút
- Admin API dùng `no-store`, không cache
- Nếu chưa cấu hình Supabase, trang chủ dùng dữ liệu mẫu để không bị trắng trang

---

## 🎨 Giao diện

| Màu | Mã |
|---|---|
| Cream | `#fffced` |
| Avocado | `#c7db95` |
| Deep Green | `#184d39` |

Phong cách: nhẹ nhàng · vintage · thân thiện · dễ thương · tối ưu mobile · phù hợp thương hiệu bakery & cafe.

---

## ⚙️ Công nghệ sử dụng

| Công nghệ | Mục đích |
|---|---|
| Next.js | Frontend + Server API |
| React | UI Components |
| Tailwind CSS v4 | Styling |
| Supabase | Database |
| Cloudinary | Image / Video CDN |
| Vercel | Hosting & Serverless |
| TypeScript | Type safety |

---

## 🚀 Cài đặt trên Windows

**Yêu cầu:** Node.js 22+, npm

Mở PowerShell tại thư mục dự án:

```powershell
npm install
Copy-Item ".env.example" ".env.local"
notepad ".env.local"
npm run dev
```

- Trang chính: `http://localhost:3000`
- Trang Admin: `http://localhost:3000/admin`

---

## 🗄️ Cấu hình Supabase

1. Mở **Supabase Dashboard** → **SQL Editor** → **New Query**
2. Dán toàn bộ nội dung file `supabase/schema.sql`
3. Bấm **Run**

Schema sẽ tạo các bảng, index và Row Level Security cho: thông tin quán, danh mục, sản phẩm, bản tin, đặt bàn.

> Nếu dự án có migration bổ sung, chạy thêm các file SQL tương ứng trong thư mục `supabase/`.

---

## 🔐 Biến môi trường

Tạo `.env.local` từ `.env.example`. **Không commit `.env.local` lên GitHub.**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

ADMIN_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_FOLDER=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Các biến sau **phải luôn ở phía server**, không thêm tiền tố `NEXT_PUBLIC_`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_API_KEY`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## 🔒 Bảo mật Admin

- Cookie `HttpOnly`, `SameSite=Strict`, session tự hết hạn (12 giờ)
- API Admin không cache (`no-store`)
- Supabase Service Role chỉ hoạt động phía server
- Cloudinary API Secret không gửi xuống trình duyệt

⚠️ **Bắt buộc:** mọi secret từng được gửi qua tin nhắn (database password, Supabase service role, Cloudinary API secret, mã Admin) phải được **tạo lại** trước khi deploy. Khóa publishable/anon có thể công khai nhưng chỉ an toàn khi RLS trong `schema.sql` đã bật.

---

