
import NewPostForm from '../NewPostForm';
import Link from 'next/link';

export default function AdminPage(){
  return (
    <div className='min-h-screen p-10 flex flex-col items-center justify-center'>
      <h1 className='text-3xl font-bold text-red-500 mb-6'>Zona de Administrador</h1>
      <p className='mb-8 text-gray-400'>Solo el dueño del blog debería ver esto.</p>
    <div className='w-full max-w-md'>
      <NewPostForm />
    </div>

    <Link href="/" className='mt-8 text-blue-400 hover:underline'>
      &larr; Ir a ver el blog público
    </Link>
    </div>
  );
}