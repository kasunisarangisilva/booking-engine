import BookingEngine from '../components/BookingEngine';
import Head from 'next/head';

export default function BookingEnginePage() {
    return (
        <>
            <Head>
                <title>Booking Engine | Embeddable Wizard</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <BookingEngine />
        </>
    );
}

// Disable global navbar/footer for this page if it's meant to be embedded
BookingEnginePage.noLayout = true;
