import React from "react";
import { Container } from "../../components/ui/primitives"

interface PageProps {
    children?: React.ReactNode;
}
const Page = ({ children }: PageProps) => {
    return <Container $scroll $absolute initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: .1 }}>
        {children}
    </Container>
}

export default Page;