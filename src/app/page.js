import Link from 'next/link';

export default function Home(){
  return (
    <div>
      <header>
        <h1 className="text-4xl font-bold text-blue-500">
          Denshi blog
        </h1>
        <p className="mt-4 text-xl">
          Bienvenido a mi rincon en internet.
        </p>
      </header>



      <main className="mt-10">
        <div className="p-6 border border-gray-700 rounded-lg">
          <h2 className="text2-xl font-semibold">Mi primera entrada</h2>
          <p className="mt-2 text-gray-300">
            Hola mundo, estoy aprendiendo a crear esto con Next.js.
          </p>
        </div>
      </main>
    </div>
  );
}