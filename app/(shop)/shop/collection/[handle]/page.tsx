type Props={params:{handle:string}};
export default function Page({params}:Props){return <main className="p-8">Collection: {params.handle}</main>;}
