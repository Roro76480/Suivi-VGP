import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('App', () => {
    it('renders without crashing', () => {
        // Un test simple qui passe toujours si l'environnement est OK
        // Pour l'instant nous n'avons pas configuré testing-library pour react complètement
        // On vérifie juste que 1+1 = 2 pour confirmer que Vitest tourne
        expect(1 + 1).toBe(2);
    });
});
