// prisma/seeds/essay.js

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get existing materi
  const materi = await prisma.materi.findFirst({
    where: {
      judul: "Media dan Jaringan Telekomunikasi"
    }
  })

  if (!materi) {
    throw new Error("Materi 'Media dan Jaringan Telekomunikasi' not found. Please run quiz seed first.")
  }

  // Create quiz
  const quiz = await prisma.quiz.create({
    data: {
      materiId: materi.id,
      judul: "Essay Media dan Jaringan Telekomunikasi",
      deskripsi: "Evaluasi pemahaman mendalam tentang media transmisi dan jaringan telekomunikasi",
      type: "ESSAY",
      status: true,
      soalEssay: {
        create: [
          {
            pertanyaan: "Jelaskan perbedaan prinsip kerja antara kabel UTP dan fiber optik dalam mentransmisikan data. Berikan minimal 3 perbedaan mendasar antara keduanya.",
            status: true
          },
          {
            pertanyaan: "Dalam implementasi jaringan 5G, mengapa penggunaan frekuensi tinggi menjadi sangat penting? Jelaskan tantangan dan solusi dalam implementasi jaringan 5G terkait dengan karakteristik frekuensi tinggi tersebut.",
            status: true
          },
          {
            pertanyaan: "Bandingkan dan analisis keuntungan serta kerugian penggunaan topologi star dan mesh dalam implementasi jaringan perusahaan besar. Berikan contoh kasus yang sesuai untuk masing-masing topologi.",
            status: true
          },
          {
            pertanyaan: "Bagaimana cara kerja teknologi MIMO (Multiple Input Multiple Output) dalam meningkatkan performa jaringan wireless? Jelaskan minimal 3 keuntungan penggunaan teknologi ini.",
            status: true
          },
          {
            pertanyaan: "Jelaskan proses terjadinya total internal reflection pada fiber optik dan mengapa prinsip ini sangat penting dalam transmisi data melalui kabel fiber optik.",
            status: true
          },
          {
            pertanyaan: "Analisis perbedaan implementasi keamanan jaringan antara media transmisi kabel dan wireless. Berikan solusi untuk meningkatkan keamanan pada masing-masing jenis media transmisi tersebut.",
            status: true
          },
          {
            pertanyaan: "Bagaimana cara kerja teknologi Power over Ethernet (PoE)? Jelaskan keuntungan dan aplikasi penggunaannya dalam jaringan modern.",
            status: true
          },
          {
            pertanyaan: "Jelaskan konsep dan implementasi Software-Defined Networking (SDN) dalam manajemen jaringan modern. Apa keuntungan utama penggunaan SDN dibandingkan dengan manajemen jaringan tradisional?",
            status: true
          },
          {
            pertanyaan: "Bandingkan karakteristik dan use case yang sesuai untuk penggunaan Wi-Fi 6 (802.11ax) dengan Wi-Fi 5 (802.11ac). Berikan contoh implementasi yang optimal untuk masing-masing standar.",
            status: true
          },
          {
            pertanyaan: "Jelaskan proses troubleshooting sistematis ketika menghadapi masalah pada jaringan fiber optik. Sebutkan minimal 3 masalah umum dan cara penanganannya.",
            status: true
          }
        ]
      }
    }
  })

  console.log('Created essay quiz data:', { quiz })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })