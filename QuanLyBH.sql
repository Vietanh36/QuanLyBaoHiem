-- 1. Tạo database mới (nếu chưa có)
CREATE DATABASE QuanLyBaoHiem;
GO

USE QuanLyBaoHiem;
GO

-- 2. Tạo bảng Bảo hiểm ô tô
CREATE TABLE dbo.BaoHiemOTo (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    tenKhach    NVARCHAR(100) NOT NULL,
    sdt         VARCHAR(20),
    diaChi      NVARCHAR(200),
    ngayCap     DATE NOT NULL,
    ngayHetHan  DATE NOT NULL,
    hangBH      NVARCHAR(50),
    loaiXe      NVARCHAR(50),
    bienSo      VARCHAR(20) UNIQUE NOT NULL,     -- Không cho trùng biển số
    vin         VARCHAR(50),
    note        NVARCHAR(500),
    created_at  DATETIME DEFAULT GETDATE()
);
GO

-- 3. Kiểm tra bảng đã tạo
SELECT * FROM dbo.BaoHiemOTo;