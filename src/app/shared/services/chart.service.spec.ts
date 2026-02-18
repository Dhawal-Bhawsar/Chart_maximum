import { TestBed } from '@angular/core/testing';
import { ChartService } from './chart.service';
import { ChartOptions, ChartDimensions } from '../models/chart.models';

describe('ChartService', () => {
    let service: ChartService;

    const mockDims: ChartDimensions = {
        width: 600, height: 320,
        marginTop: 20, marginRight: 30, marginBottom: 50, marginLeft: 60,
        innerWidth: 510, innerHeight: 250,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChartService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // ===== validateOptions =====
    describe('validateOptions', () => {
        it('should return no errors for valid options', () => {
            const opts: ChartOptions = {
                type: 'line',
                title: 'Test',
                series: [{ name: 'A', value: 10, color: '#fff' }],
            };
            expect(service.validateOptions(opts)).toEqual([]);
        });

        it('should error on invalid type', () => {
            const opts = { type: 'bar' as any, title: 'T', series: [{ name: 'A', value: 1, color: '#fff' }] };
            const errs = service.validateOptions(opts);
            expect(errs.some(e => e.includes('Invalid chart type'))).toBeTrue();
        });

        it('should error on empty title', () => {
            const opts: ChartOptions = { type: 'line', title: '  ', series: [{ name: 'A', value: 1, color: '#fff' }] };
            const errs = service.validateOptions(opts);
            expect(errs.some(e => e.includes('title'))).toBeTrue();
        });

        it('should error on empty series', () => {
            const opts: ChartOptions = { type: 'pie', title: 'T', series: [] };
            const errs = service.validateOptions(opts);
            expect(errs.some(e => e.includes('series'))).toBeTrue();
        });

        it('should error on negative value', () => {
            const opts: ChartOptions = { type: 'column', title: 'T', series: [{ name: 'A', value: -5, color: '#fff' }] };
            const errs = service.validateOptions(opts);
            expect(errs.some(e => e.includes('negative'))).toBeTrue();
        });
    });

    // ===== computeLinePoints =====
    describe('computeLinePoints', () => {
        it('should return correct number of points', () => {
            const series = [
                { name: 'A', value: 10, color: '#f00' },
                { name: 'B', value: 20, color: '#0f0' },
                { name: 'C', value: 30, color: '#00f' },
            ];
            const pts = service.computeLinePoints(series, mockDims);
            expect(pts.length).toBe(3);
        });

        it('should place first point at left margin', () => {
            const series = [
                { name: 'A', value: 50, color: '#f00' },
                { name: 'B', value: 50, color: '#0f0' },
            ];
            const pts = service.computeLinePoints(series, mockDims);
            expect(pts[0].x).toBe(mockDims.marginLeft);
        });

        it('should place last point at right edge', () => {
            const series = [
                { name: 'A', value: 50, color: '#f00' },
                { name: 'B', value: 50, color: '#0f0' },
            ];
            const pts = service.computeLinePoints(series, mockDims);
            expect(pts[pts.length - 1].x).toBeCloseTo(mockDims.marginLeft + mockDims.innerWidth);
        });

        it('should place max value at top (marginTop)', () => {
            const series = [
                { name: 'A', value: 100, color: '#f00' },
                { name: 'B', value: 0, color: '#0f0' },
            ];
            const pts = service.computeLinePoints(series, mockDims);
            expect(pts[0].y).toBeCloseTo(mockDims.marginTop);
        });

        it('should return empty array for empty series', () => {
            expect(service.computeLinePoints([], mockDims)).toEqual([]);
        });
    });

    // ===== computePieSlices =====
    describe('computePieSlices', () => {
        it('should return correct number of slices', () => {
            const series = [
                { name: 'A', value: 30, color: '#f00' },
                { name: 'B', value: 70, color: '#0f0' },
            ];
            const slices = service.computePieSlices(series, 200, 160, 120);
            expect(slices.length).toBe(2);
        });

        it('should have percentages summing to 100', () => {
            const series = [
                { name: 'A', value: 25, color: '#f00' },
                { name: 'B', value: 50, color: '#0f0' },
                { name: 'C', value: 25, color: '#00f' },
            ];
            const slices = service.computePieSlices(series, 200, 160, 120);
            const total = slices.reduce((s, sl) => s + sl.percentage, 0);
            expect(total).toBeCloseTo(100, 1);
        });

        it('should have angles spanning full circle (2π)', () => {
            const series = [
                { name: 'A', value: 1, color: '#f00' },
                { name: 'B', value: 1, color: '#0f0' },
                { name: 'C', value: 2, color: '#00f' },
            ];
            const slices = service.computePieSlices(series, 200, 160, 120);
            const lastSlice = slices[slices.length - 1];
            const firstSlice = slices[0];
            const totalAngle = lastSlice.endAngle - firstSlice.startAngle;
            expect(totalAngle).toBeCloseTo(2 * Math.PI, 5);
        });

        it('should return empty array for zero total', () => {
            const series = [{ name: 'A', value: 0, color: '#f00' }];
            expect(service.computePieSlices(series, 200, 160, 120)).toEqual([]);
        });
    });

    // ===== computeBarData =====
    describe('computeBarData', () => {
        it('should return correct number of bars', () => {
            const series = [
                { name: 'A', value: 10, color: '#f00' },
                { name: 'B', value: 20, color: '#0f0' },
                { name: 'C', value: 30, color: '#00f' },
            ];
            const bars = service.computeBarData(series, mockDims);
            expect(bars.length).toBe(3);
        });

        it('should have max value bar at full inner height', () => {
            const series = [
                { name: 'A', value: 100, color: '#f00' },
                { name: 'B', value: 50, color: '#0f0' },
            ];
            const bars = service.computeBarData(series, mockDims);
            expect(bars[0].height).toBeCloseTo(mockDims.innerHeight);
        });

        it('should have bars with positive width', () => {
            const series = [{ name: 'A', value: 10, color: '#f00' }];
            const bars = service.computeBarData(series, mockDims);
            expect(bars[0].width).toBeGreaterThan(0);
        });
    });

    // ===== formatValue =====
    describe('formatValue', () => {
        it('should format integers as-is', () => {
            expect(service.formatValue(42)).toBe('42');
        });
        it('should format thousands with K', () => {
            expect(service.formatValue(1500)).toBe('1.5K');
        });
        it('should format millions with M', () => {
            expect(service.formatValue(2_500_000)).toBe('2.5M');
        });
        it('should format decimals to 1 place', () => {
            expect(service.formatValue(3.7)).toBe('3.7');
        });
    });

    // ===== buildSmoothPath =====
    describe('buildSmoothPath', () => {
        it('should start with M for single point', () => {
            const pts = [{ x: 10, y: 20, value: 5, name: 'A', color: '#f00', index: 0 }];
            expect(service.buildSmoothPath(pts)).toMatch(/^M/);
        });

        it('should contain C (cubic bezier) for multiple points', () => {
            const pts = [
                { x: 10, y: 20, value: 5, name: 'A', color: '#f00', index: 0 },
                { x: 50, y: 40, value: 10, name: 'B', color: '#0f0', index: 1 },
            ];
            expect(service.buildSmoothPath(pts)).toContain('C');
        });

        it('should return empty string for empty array', () => {
            expect(service.buildSmoothPath([])).toBe('');
        });
    });
});
