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
      borderRadius: 3,
      '&:hover': {
        borderColor: '#D1C8B8',
      },
    }}
  >
    <CardContent>
      <Typography
        variant="h6"
        sx={{
          fontSize: '0.85rem',
          fontWeight: 700,
          mb: 1.75,
          color: 'text.primary',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </Typography>
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mb: 1.5 }} />
      {isEmpty ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'text.secondary' }}>
          <Typography variant="body2">{emptyMessage}</Typography>
        </Box>
      ) : (
        children
      )}
    </CardContent>
  </Card>
);

export default ChartCard;
