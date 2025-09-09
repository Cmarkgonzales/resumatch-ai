import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-no-repeat bg-center min-h-full">
      <section className="main-section">
        <Navbar />
        {children}
      </section>
    </main>
  );
};

export default Layout;
