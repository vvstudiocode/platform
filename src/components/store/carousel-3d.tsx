import React from 'react';
import styles from './carousel-3d.module.css';

interface Carousel3DProps {
    images: {
        url: string;
        alt?: string;
    }[];
    cardWidth?: string;
    rotationDuration?: string;
    perspective?: string;
    gap?: string;
    autoRotate?: boolean;
    paddingYDesktop?: number;
    paddingYMobile?: number;
}

export const Carousel3D: React.FC<Carousel3DProps> = ({
    images = [],
    cardWidth = '17.5em',
    rotationDuration = '32s',
    perspective = '35em',
    gap = '0.5em',
    autoRotate = true,
    paddingYDesktop = 64,
    paddingYMobile = 32
}) => {
    const n = images.length;
    if (n === 0) return null;

    return (
        <div
            className={styles.scene}
            style={{
                ['--perspective' as any]: perspective,
            }}
        >
            <div
                className={`${styles.a3d} ${autoRotate ? styles.animate : ''}`}
                style={{
                    ['--n' as any]: n,
                    ['--duration' as any]: rotationDuration,
                }}
            >
                {images.map((image, i) => (
                    <img
                        key={i}
                        className={styles.card}
                        src={image.url}
                        alt={image.alt || 'card'}
                        style={{
                            ['--i' as any]: i,
                            ['--w' as any]: cardWidth,
                            ['--gap' as any]: gap,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
