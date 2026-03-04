# Task Planner

Hazir bir Gantt kutuphanesi kullanmadan gelistirilmis, gorev ve alt gorev planlamasi icin tasarlanmis bir task planner uygulamasi.

Uygulama; sabit sol kolonlu bir gorev tablosu ile sag tarafta zaman cizelgesini birlestirir. Alt gorevler timeline uzerinde suruklenebilir ve yeniden boyutlandirilabilir, ana gorev tarih araligi ise bagli alt gorevlerden otomatik olarak turetilir.

## Kurulum ve Calistirma

Gelistirme ortami:

```bash
npm install
npm run dev
```

Uretim derlemesi:

```bash
npm run build
npm run preview
```

Lint kontrolu:

```bash
npm run lint
```

## Kullanilan Teknolojiler

- React 19
- TypeScript
- Vite
- Ant Design
- Redux Toolkit + react-redux
- styled-components
- dayjs (`isoWeek` ve `dayOfYear` eklentileri ile)
- `react-rnd` (drag/resize davranislari icin)

## Temel Ozellikler

- Drawer uzerinden `MAIN` ve `SUB` gorev ekleme
- Mevcut gorevleri drawer uzerinden guncelleme
- Sol sabit kolonlarda quick add (`+`) ile secili ana gorev altina hizli `SUB` ekleme
- `DAY`, `WEEK` ve `MONTH` timeline gorunumleri
- Yil bazli ileri/geri gezinme
- `SUB` task barlari uzerinde drag ve resize
- `MAIN` task tarih araliginin alt gorevlerden otomatik hesaplanmasi
- Sabit kolonlarda siralama:
  - Gorev adi
  - Baslangic
  - Sure
- Acik/koyu tema degistirme

## Is Kurallari ve Varsayimlar

- Cakisma kontrolu yalnizca ayni `MAIN` altindaki `SUB` task'lar icin uygulanir
- Farkli `MAIN` gorevlerine bagli `SUB` task'lar arasinda tarih cakismasi serbesttir
- `MAIN` gorev olusturma ve guncelleme akisinda tarih girisi yoktur
- `MAIN` gorev baslangic ve bitis degerleri sadece bagli `SUB` task'lara gore hesaplanir
- Drawer submit sirasinda tarih cakismasi kontrol edilir
- Drag/resize sonrasinda tarih cakismasi kontrol edilir
- Reducer seviyesinde de koruyucu kontroller bulunur
- Hafta sonu gunlerine gorev baslangic veya bitis tarihi atanamaz

## Proje Yapisi

- `src/app`: Redux store, provider yapisi ve typed hook'lar
- `src/features/tasks`: task slice, selector'lar, tipler, yardimcilar ve mock seed verisi
- `src/features/timeline`: timeline slice, tipler ve tarih/grid yardimcilari
- `src/features/ui`: drawer, siralama ve tema durumu
- `src/features/gantt`: Gantt tipleri, sabitler ve timeline hesaplama yardimcilari
- `src/components/atoms`: kucuk tekrar kullanilabilir UI parcaciklari
- `src/components/molecules`: task bar ve icerik gibi orta seviye bilesenler
- `src/components/organisms`: toolbar, tablo ve drawer gibi ana UI bloklari
- `src/pages/TaskPlannerPage`: sayfa seviyesi giris bileseni
- `src/styles`: tema ve global stil tanimlari
- `src/lib/dayjs.ts`: dayjs eklenti kurulumlari

## Etkilesim Modeli

- `MAIN` gorevler ust satir olarak listelenir
- Her `MAIN` altinda bagli `SUB` gorevler ayrik satirlarda gosterilir
- `SUB` task bar'lar sadece yatay eksende hareket eder
- Resize islemleri sol ve sag kenarlardan yapilir
- Timeline gorunumu degistikce piksel-tarih donusumleri secili olcege gore yeniden hesaplanir
