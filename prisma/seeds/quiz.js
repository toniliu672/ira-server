// prisma/seeds/quiz.js

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create materi first
  const materi = await prisma.materi.create({
    data: {
      judul: "Media dan Jaringan Telekomunikasi",
      tujuanPembelajaran: [
        "Memahami konsep dasar media transmisi jaringan",
        "Mengenal berbagai jenis jaringan telekomunikasi"
      ],
      capaianPembelajaran: [
        "Siswa mampu mengidentifikasi berbagai jenis media transmisi",
        "Siswa dapat menjelaskan karakteristik jaringan telekomunikasi"
      ],
      urutan: 1,
      status: true,
    }
  })

  // Create quiz
  const quiz = await prisma.quiz.create({
    data: {
      materiId: materi.id,
      judul: "Quiz Media dan Jaringan Telekomunikasi",
      deskripsi: "Evaluasi pemahaman tentang media transmisi dan jaringan telekomunikasi",
      type: "MULTIPLE_CHOICE",
      status: true,
      soalPg: {
        create: [
          {
            pertanyaan: "Media transmisi yang menggunakan gelombang cahaya untuk mengirimkan data adalah...",
            opsiJawaban: [
              "Kabel UTP",
              "Fiber Optik",
              "Kabel Coaxial",
              "Wireless"
            ],
            kunciJawaban: 1,
            status: true
          },
          {
            pertanyaan: "Berikut ini yang merupakan keunggulan media transmisi wireless adalah...",
            opsiJawaban: [
              "Kecepatan transfer data paling tinggi",
              "Keamanan data lebih terjamin",
              "Mudah dalam instalasi dan mobilitas tinggi",
              "Tidak terpengaruh interferensi elektromagnetik"
            ],
            kunciJawaban: 2,
            status: true
          },
          {
            pertanyaan: "Kabel UTP kategori 6 (Cat6) mampu mentransmisikan data dengan kecepatan hingga...",
            opsiJawaban: [
              "100 Mbps",
              "1 Gbps",
              "10 Gbps",
              "40 Gbps"
            ],
            kunciJawaban: 2,
            status: true
          },
          {
            pertanyaan: "Teknologi jaringan seluler yang mendukung Internet of Things (IoT) dan menggunakan frekuensi tinggi adalah...",
            opsiJawaban: [
              "3G",
              "4G LTE",
              "5G",
              "WiMAX"
            ],
            kunciJawaban: 2,
            status: true
          },
          {
            pertanyaan: "Jenis topologi jaringan yang memiliki node pusat sebagai pengendali adalah...",
            opsiJawaban: [
              "Ring",
              "Bus",
              "Star",
              "Mesh"
            ],
            kunciJawaban: 2,
            status: true
          },
          {
            pertanyaan: "Media transmisi yang paling tahan terhadap interferensi elektromagnetik adalah...",
            opsiJawaban: [
              "Kabel UTP",
              "Kabel Coaxial",
              "Wireless",
              "Fiber Optik"
            ],
            kunciJawaban: 3,
            status: true
          },
          {
            pertanyaan: "Standar WiFi 802.11ac beroperasi pada frekuensi...",
            opsiJawaban: [
              "2.4 GHz",
              "5 GHz",
              "2.4 GHz dan 5 GHz",
              "6 GHz"
            ],
            kunciJawaban: 1,
            status: true
          },
          {
            pertanyaan: "Perangkat yang berfungsi untuk menghubungkan dua jaringan yang berbeda adalah...",
            opsiJawaban: [
              "Hub",
              "Switch",
              "Router",
              "Repeater"
            ],
            kunciJawaban: 2,
            status: true
          },
          {
            pertanyaan: "Dalam jaringan fiber optik, peristiwa pembiasan cahaya yang terjadi disebut...",
            opsiJawaban: [
              "Difraksi",
              "Total Internal Reflection",
              "Dispersi",
              "Atenuasi"
            ],
            kunciJawaban: 1,
            status: true
          },
          {
            pertanyaan: "Protocol yang digunakan untuk mengatur komunikasi data dalam jaringan TCP/IP adalah...",
            opsiJawaban: [
              "HTTP",
              "FTP",
              "IP",
              "SMTP"
            ],
            kunciJawaban: 2,
            status: true
          }
        ]
      }
    }
  })

  console.log('Created quiz data:', { materi, quiz })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })