# Sagala Tech — Company Profile

Website company profile dengan panel admin untuk mengelola artikel, info kontak, dan pesan masuk.

**Stack:** React + Vite + Tailwind (frontend) · Express + SQLite (API) · login admin berbasis cookie httpOnly (JWT).

## Pengembangan

```bash
npm install
cp .env.example .env   # isi ADMIN_PASSWORD
export $(grep -v '^#' .env | xargs)
npm run dev            # web :5173, api :3001
```

Admin: http://localhost:5173/admin/login — akun dibuat otomatis dari `ADMIN_USERNAME`/`ADMIN_PASSWORD` saat server pertama kali jalan.

## Deploy ke VPS

```bash
git clone <repo> /var/www/sagala_compro && cd /var/www/sagala_compro
npm ci && npm run build
cp .env.example .env && nano .env        # JWT_SECRET (openssl rand -hex 32), ADMIN_PASSWORD
sudo cp deploy/sagalatech.service /etc/systemd/system/
sudo chown -R www-data . && sudo systemctl enable --now sagalatech
sudo cp deploy/nginx.conf /etc/nginx/sites-available/sagalatech   # lalu symlink ke sites-enabled
sudo certbot --nginx -d domainanda.com
```

Satu proses Node melayani API, gambar upload, dan frontend hasil build. Data ada di `data/sagala.db` dan `uploads/` — **cadangkan kedua folder ini**.
Setelah admin pertama terbuat, `ADMIN_PASSWORD` boleh dihapus dari `.env`.
