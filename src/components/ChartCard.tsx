import { Card, CardContent, Typography, Box } from '@mui/material';

interface ChartCardProps {
  title: string;
  emptyMessage: string;
  isEmpty: boolean;
  children: React.ReactNode;
}

const ChartCard = ({ title, emptyMessage, isEmpty, children }: ChartCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
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
