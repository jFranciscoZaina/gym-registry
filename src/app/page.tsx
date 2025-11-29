// Ejemplo rápido en cualquier componente
async function testRegister() {
  const res = await fetch("/api/gym/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Gimnasio Demo",
      email: "demo@gym.com",
      password: "secret123",
    }),
  })

  console.log(await res.json())
}

async function testLogin() {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "demo@gym.com",
      password: "secret123",
    }),
  })

  console.log(await res.json())
}


export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        hola
      </main>
    </div>
  );
}
