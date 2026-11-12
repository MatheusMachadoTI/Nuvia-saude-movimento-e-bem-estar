const iconShapes = {
  home: [['path', { d: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }], ['path', { d: 'M9 22V12h6v10' }]],
  dumb: [['path', { d: 'M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11' }]],
  chart: [['path', { d: 'm22 7-8.5 8.5-5-5L2 17' }], ['path', { d: 'M16 7h6v6' }]],
  user: [['circle', { cx: 12, cy: 8, r: 4 }], ['path', { d: 'M4 21a8 8 0 0 1 16 0' }]],
  food: [['path', { d: 'M3 2v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2M6 2v20M19 2c-2 1-3 4-3 8h3v12' }]],
  moon: [['path', { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z' }]],
  plus: [['path', { d: 'M12 5v14M5 12h14' }]],
  trash: [['path', { d: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6' }]],
  check: [['path', { d: 'm20 6-11 11-5-5' }]],
  play: [['path', { d: 'M6 3l14 9-14 9z' }]],
  x: [['path', { d: 'M18 6 6 18M6 6l12 12' }]],
  edit: [['path', { d: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z' }]],
  target: [['circle', { cx: 12, cy: 12, r: 9 }], ['circle', { cx: 12, cy: 12, r: 4 }]],
  cam: [['path', { d: 'M4 7h3l2-3h6l2 3h3v13H4z' }], ['circle', { cx: 12, cy: 13, r: 4 }]],
  back: [['path', { d: 'm15 18-6-6 6-6' }]],
  cal: [['rect', { x: 3, y: 4, width: 18, height: 18, rx: 3 }], ['path', { d: 'M16 2v4M8 2v4M3 10h18' }]],
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(iconShapes[name] || []).map(([tag, props], index) => {
        const Shape = tag;
        return <Shape key={`${name}-${index}`} {...props} />;
      })}
    </svg>
  );
}
