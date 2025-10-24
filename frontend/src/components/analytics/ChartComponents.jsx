import { Box, Typography, Avatar, Chip } from '@mui/material';
import { Assessment, PieChart as PieChartIcon, Timeline } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const getPastMonths = () => {
  const months = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleString('default', { 
      month: 'long',
      year: 'numeric'
    });
    
    months.push({
      value: monthValue,
      label: monthLabel
    });
  }
  return months;
};

export const CategoryDistributionChart = ({ distribution, showPercentages, showLegend, height = 450, innerRadius = 70, outerRadius = 120 }) => {
  if (!distribution || distribution.length === 0) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        <Box>
          <PieChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
            No category data available
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Add expenses with categories to see distribution
          </Typography>
        </Box>
      </Box>
    );
  }

  const pieData = distribution.map(item => ({
    name: item.name,
    value: item.value
  }));

  return (
    <Box sx={{ height, position: 'relative', overflow: 'visible', pb: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="40%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              name,
              percent
            }) => {
              const RADIAN = Math.PI / 180;
              const radius = outerRadius * 1.05;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="white"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontSize="11px"
                  fontWeight="600"
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="0.5"
                >
                  {`${name} (${(percent * 100).toFixed(0)}%)`}
                </text>
              );
            }}
          >
            {pieData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '8px',
              color: 'black',
              backdropFilter: 'blur(10px)',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            labelStyle={{
              color: 'black',
              fontSize: '14px',
              fontWeight: '600',
            }}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '0px',
                marginTop: '-20px',
                color: 'rgba(255,255,255,0.8)',
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const ExpenseTrendChart = ({ data, title, height = 400 }) => {
  return (
    <Box sx={{ height: { xs: 300, sm: height }, width: '100%' }}>
      {data && data.length > 0 ? (
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: window.innerWidth < 600 ? 10 : 30,
              left: window.innerWidth < 600 ? 10 : 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => {
                const formattedDate = new Date(date);
                return window.innerWidth < 600 
                  ? formattedDate.toLocaleDateString('en-IN', { day: '2-digit' })
                  : formattedDate.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short'
                    });
              }}
              stroke="rgba(255,255,255,0.7)"
              fontSize={window.innerWidth < 600 ? 10 : 12}
            />
            <YAxis
              tickFormatter={(value) => `₹${value}`}
              stroke="rgba(255,255,255,0.7)"
              fontSize={window.innerWidth < 600 ? 10 : 12}
            />
            <Tooltip
              labelFormatter={(date) => {
                const formattedDate = new Date(date);
                return formattedDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              }}
              formatter={(value) => [`₹${value}`, 'Amount']}
              contentStyle={{
                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#2196f3"
              strokeWidth={3}
              activeDot={{ r: 8, fill: '#64b5f6' }}
              name="Daily Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          <Box>
            <Timeline sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary" variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              No expense data available
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Add some expenses to see your spending trends
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  gradient, 
  chipLabel, 
  chipColor = 'primary',
  index = 0 
}) => {
  const colorMap = {
    primary: '#2196f3',
    success: '#4caf50',
    secondary: '#f50057',
    warning: '#ff9800',
    info: '#2196f3',
  };

  const gradientMap = {
    primary: 'linear-gradient(90deg, #2196f3, #64b5f6)',
    success: 'linear-gradient(90deg, #4caf50, #81c784)',
    secondary: 'linear-gradient(90deg, #f50057, #ff4081)',
    warning: 'linear-gradient(90deg, #ff9800, #ffb74d)',
    info: 'linear-gradient(90deg, #2196f3, #64b5f6)',
  };

  const finalGradient = gradient || gradientMap[color] || `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`;
  const finalColor = colorMap[color] || COLORS[index % COLORS.length];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
      <Avatar
        sx={{
          background: finalGradient,
          mr: 1.5,
          width: 36,
          height: 36,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Avatar>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
        {title}
      </Typography>
    </Box>
  );
};

export { COLORS };
