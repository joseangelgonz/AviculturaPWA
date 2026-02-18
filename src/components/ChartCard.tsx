import { Card, CardContent, Typography, Box } from '@mui/material';

interface ChartCardProps {
  title: string;
  emptyMessage: string;
  isEmpty: boolean;
  children: React.ReactNode;
}

const ChartCard = ({ title, emptyMessage, isEmpty, children }: ChartCardProps) => (
  <Card
    sx={{
      height: '100%',
      minWidth: 0,
      overflow: 'hidden',
      borderRadius: 'var(--ds-radius-lg, 10px)',
      '&:hover': {
        borderColor: '#D1C8B8',
      },
    }}
  >
    <CardContent sx={{ minWidth: 0, overflow: 'hidden' }}>
      <Typography
        variant="h6"
        sx={{
          fontSize: '0.85rem',
          fontWeight: 700,
          mb: 1.75,
          color: 'text.primary',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </Typography>
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mb: 1.5 }} />
      {isEmpty ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'text.secondary', minWidth: 0 }}>
          <Typography variant="body2">{emptyMessage}</Typography>
        </Box>
      ) : (
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>{children}</Box>
      )}
    </CardContent>
  </Card>
);

export default ChartCard;
