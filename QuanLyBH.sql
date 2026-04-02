CREATE DATABASE QuanLyBaoHiemOto;
GO

USE QuanLyBaoHiemOto;
GO

CREATE TABLE BaoHiemOto (
    id BIGINT PRIMARY KEY,
    ten_khach NVARCHAR(255) NOT NULL,
    sdt VARCHAR(20) NOT NULL,
    dia_chi NVARCHAR(255),
    ngay_cap DATE NOT NULL,
    ngay_het_han DATE NOT NULL,
    hang_bao_hiem NVARCHAR(100) NOT NULL,
    loai_xe NVARCHAR(100),
    bien_so VARCHAR(20) NOT NULL UNIQUE,
    so_khung VARCHAR(50),
    note NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE()
);
CREATE INDEX idx_bien_so ON BaoHiemOto(bien_so);
CREATE INDEX idx_ngay_het_han ON BaoHiemOto(ngay_het_han);
CREATE INDEX idx_ten_khach ON BaoHiemOto(ten_khach);

INSERT INTO BaoHiemOto (
    id, ten_khach, sdt, dia_chi, ngay_cap, ngay_het_han,
    hang_bao_hiem, loai_xe, bien_so, so_khung, note
)
VALUES
(1710000000001, N'Nguyễn Văn A', '0987654321', N'Hà Nội', '2025-01-01', '2026-01-01', N'Bảo Việt', N'Toyota Camry', '30A-12345', 'VIN001', N'Khách VIP'),

(1710000000002, N'Trần Văn B', '0912345678', N'Hải Phòng', '2025-03-01', '2026-03-01', N'PTI', N'Honda CR-V', '15A-67890', 'VIN002', N''),

(1710000000003, N'Lê Văn C', '0909090909', N'Đà Nẵng', '2024-12-01', '2025-12-01', N'Liberty', N'Ford Ranger', '43A-11111', 'VIN003', N'Sắp hết hạn');

SELECT * FROM BaoHiemOto ORDER BY created_at DESC; //lấy toàn bộ danh sách
