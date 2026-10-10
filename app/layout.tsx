import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'WikiRace – Ein Ziel. Dein Weg.',description:'Finde deinen Weg durch die deutschsprachige Wikipedia. Ein Startartikel, ein Ziel und unzählige Entdeckungen.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="de"><body>{children}</body></html>}
