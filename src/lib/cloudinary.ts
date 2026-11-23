import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function ambilPublicId(url: string): string | null {
  const cocok = url.match(
    /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)$/
  );
  if (!cocok) return null;
  return cocok[1].replace(/\.[^./]+$/, "");
}

export async function hapusGambar(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const publicId = ambilPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // ponytail: best-effort; gagal hapus aset lama tak boleh menggagalkan aksi utama.
  }
}

export function unggahGambar(berkas: File): Promise<string> {
  return berkas.arrayBuffer().then(
    (buf) =>
      new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "nur-coffee/menu", resource_type: "image" },
          (error, hasil) => {
            if (error || !hasil) {
              reject(new Error("Gagal mengunggah gambar ke Cloudinary."));
              return;
            }
            resolve(hasil.secure_url);
          }
        );
        stream.end(Buffer.from(buf));
      })
  );
}
