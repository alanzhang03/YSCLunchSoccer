'use client';
import styles from './SessionCard.module.scss';
import Image from 'next/image';

const PaymentSection = ({ hasPaid, isLoadingPayment, isPaymentProcessing, onPayment }) => {
  if (isLoadingPayment) {
    return (
      <div className={styles.paymentSection}>
        <div className={styles.paymentLoading}>
          Checking payment status...
        </div>
      </div>
    );
  }

  if (hasPaid) {
    return (
      <div className={styles.paymentSection}>
        <div className={styles.paymentStatus}>
          <span className={styles.paidBadge}>Paid</span>
          <span className={styles.paidText}>
            You have paid for this session
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.paymentSection}>
      <button
        className={styles.payButton}
        onClick={onPayment}
        disabled={isPaymentProcessing}
      >
        {isPaymentProcessing ? (
          'Processing...'
        ) : (
          <>
            <svg
              className={styles.stripeIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.479 9.883c-1.626-.604-2.512-1.067-2.512-1.803 0-.622.511-.977 1.423-.977 1.667 0 3.379.642 4.558 1.22l.666-4.111c-.935-.446-2.847-1.177-5.49-1.177-1.87 0-3.425.489-4.536 1.401-1.155.954-1.757 2.334-1.757 4 0 3.023 1.847 4.312 4.847 5.403 1.936.711 2.512 1.289 2.512 2.067 0 .889-.8 1.378-2.269 1.378-1.867 0-4.047-.867-5.692-1.867l-.711 4.178c1.289.622 3.22 1.489 6.003 1.489 2.025 0 3.58-.511 4.714-1.489 1.178-.978 1.803-2.423 1.803-4.223 0-2.936-1.847-4.356-5.047-5.489z"
                fill="currentColor"
              />
            </svg>
            Pay for Session
          </>
        )}
      </button>
      <div className={styles.stripeBadge}>
        <Image
          src='/logos/poweredByStripe.svg'
          alt='Powered by Stripe'
          width={120}
          height={32}
        />
      </div>
    </div>
  );
};

export default PaymentSection;
