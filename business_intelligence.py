import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import warnings
warnings.filterwarnings('ignore')

class BusinessIntelligence:
    """
    Automated Business Intelligence module for generating insights,
    detecting anomalies, and providing business recommendations.
    """
    
    def __init__(self, data):
        self.data = data
        self.insights = {}
        self.recommendations = []
        
    def analyze_business_metrics(self):
        """Analyze key business metrics and KPIs"""
        insights = {
            'data_overview': self._get_data_overview(),
            'business_metrics': self._calculate_business_metrics(),
            'trend_analysis': self._analyze_trends(),
            'anomaly_detection': self._detect_anomalies(),
            'recommendations': self._generate_recommendations()
        }
        
        self.insights = insights
        return insights
    
    def _get_data_overview(self):
        """Get comprehensive data overview"""
        # Convert data types to strings for JSON serialization
        data_types = {}
        for col, dtype in self.data.dtypes.items():
            if 'datetime' in str(dtype):
                data_types[col] = 'datetime'
            elif 'int' in str(dtype):
                data_types[col] = 'integer'
            elif 'float' in str(dtype):
                data_types[col] = 'float'
            else:
                data_types[col] = 'object'
        
        overview = {
            'total_records': len(self.data),
            'total_columns': len(self.data.columns),
            'columns': list(self.data.columns),
            'data_types': data_types,
            'missing_values': self.data.isnull().sum().to_dict(),
            'unique_values': {col: self.data[col].nunique() for col in self.data.columns},
            'memory_usage': self.data.memory_usage(deep=True).sum(),
            'numeric_columns': list(self.data.select_dtypes(include=[np.number]).columns),
            'categorical_columns': list(self.data.select_dtypes(include=['object']).columns),
            'date_columns': list(self.data.select_dtypes(include=['datetime']).columns)
        }
        
        # Add sample data for context (convert datetime to strings)
        sample_data = self.data.head(3).copy()
        for col in sample_data.columns:
            if 'datetime' in str(sample_data[col].dtype):
                sample_data[col] = sample_data[col].astype(str)
        overview['sample_data'] = sample_data.to_dict('records')
        
        # Add basic statistics for numeric columns
        if overview['numeric_columns']:
            numeric_stats = self.data[overview['numeric_columns']].describe()
            overview['numeric_stats'] = {}
            for col in numeric_stats.columns:
                overview['numeric_stats'][col] = {
                    'count': float(numeric_stats[col]['count']),
                    'mean': float(numeric_stats[col]['mean']),
                    'std': float(numeric_stats[col]['std']),
                    'min': float(numeric_stats[col]['min']),
                    '25%': float(numeric_stats[col]['25%']),
                    '50%': float(numeric_stats[col]['50%']),
                    '75%': float(numeric_stats[col]['75%']),
                    'max': float(numeric_stats[col]['max'])
                }
        
        return overview
    
    def _calculate_business_metrics(self):
        """Calculate business-relevant metrics"""
        metrics = {}
        numeric_data = self.data.select_dtypes(include=[np.number])
        
        for col in numeric_data.columns:
            metrics[col] = {
                'mean': float(numeric_data[col].mean()),
                'median': float(numeric_data[col].median()),
                'std': float(numeric_data[col].std()),
                'min': float(numeric_data[col].min()),
                'max': float(numeric_data[col].max()),
                'growth_rate': self._calculate_growth_rate(numeric_data[col])
            }
        
        # Calculate business-specific KPIs
        metrics['business_kpis'] = self._calculate_business_kpis()
        
        return metrics
    
    def _calculate_growth_rate(self, series):
        """Calculate growth rate for time series data"""
        if len(series) < 2:
            return 0
        
        try:
            growth_rate = ((series.iloc[-1] - series.iloc[0]) / series.iloc[0]) * 100
            return float(growth_rate)
        except:
            return 0
    
    def _calculate_business_kpis(self):
        """Calculate business-specific KPIs"""
        kpis = {}
        numeric_data = self.data.select_dtypes(include=[np.number])
        
        # Revenue-related metrics
        revenue_cols = [col for col in numeric_data.columns if any(keyword in col.lower() 
                       for keyword in ['revenue', 'sales', 'income', 'profit'])]
        
        if revenue_cols:
            kpis['total_revenue'] = float(numeric_data[revenue_cols[0]].sum())
            kpis['avg_revenue'] = float(numeric_data[revenue_cols[0]].mean())
            kpis['revenue_growth'] = self._calculate_growth_rate(numeric_data[revenue_cols[0]])
        
        # Customer-related metrics
        customer_cols = [col for col in numeric_data.columns if any(keyword in col.lower() 
                        for keyword in ['customer', 'user', 'client'])]
        
        if customer_cols:
            kpis['total_customers'] = float(numeric_data[customer_cols[0]].sum())
            kpis['avg_customers'] = float(numeric_data[customer_cols[0]].mean())
        
        return kpis
    
    def _analyze_trends(self):
        """Analyze trends in the data"""
        trends = {}
        numeric_data = self.data.select_dtypes(include=[np.number])
        
        for col in numeric_data.columns:
            series = numeric_data[col].dropna()
            if len(series) > 1:
                slope = np.polyfit(range(len(series)), series, 1)[0]
                trend_direction = 'increasing' if slope > 0 else 'decreasing' if slope < 0 else 'stable'
                
                trends[col] = {
                    'direction': trend_direction,
                    'slope': float(slope),
                    'trend_strength': abs(float(slope))
                }
        
        return trends
    
    def _detect_anomalies(self):
        """Detect anomalies in the data"""
        anomalies = {}
        numeric_data = self.data.select_dtypes(include=[np.number])
        
        for col in numeric_data.columns:
            series = numeric_data[col].dropna()
            if len(series) > 10:
                iso_forest = IsolationForest(contamination=0.1, random_state=42)
                anomalies_detected = iso_forest.fit_predict(series.values.reshape(-1, 1))
                
                anomaly_indices = np.where(anomalies_detected == -1)[0]
                anomaly_values = series.iloc[anomaly_indices].tolist()
                
                anomalies[col] = {
                    'anomaly_count': len(anomaly_indices),
                    'anomaly_percentage': (len(anomaly_indices) / len(series)) * 100,
                    'anomaly_values': anomaly_values
                }
        
        return anomalies
    
    def _generate_recommendations(self):
        """Generate business recommendations based on analysis"""
        recommendations = []
        
        # Revenue recommendations
        if 'business_kpis' in self.insights:
            kpis = self.insights['business_kpis']
            
            if 'revenue_growth' in kpis:
                if kpis['revenue_growth'] < 0:
                    recommendations.append({
                        'category': 'Revenue',
                        'priority': 'High',
                        'recommendation': 'Revenue is declining. Consider implementing growth strategies.',
                        'action_items': ['Analyze customer churn', 'Review pricing strategy', 'Explore new markets']
                    })
                elif kpis['revenue_growth'] > 20:
                    recommendations.append({
                        'category': 'Revenue',
                        'priority': 'Medium',
                        'recommendation': 'Strong revenue growth. Focus on scaling operations.',
                        'action_items': ['Scale infrastructure', 'Hire additional staff', 'Optimize processes']
                    })
        
        # Anomaly recommendations
        if 'anomaly_detection' in self.insights:
            anomalies = self.insights['anomaly_detection']
            high_anomaly_cols = [col for col, data in anomalies.items() 
                               if data['anomaly_percentage'] > 5]
            
            if high_anomaly_cols:
                recommendations.append({
                    'category': 'Data Quality',
                    'priority': 'High',
                    'recommendation': f'High anomaly rate detected in {len(high_anomaly_cols)} columns.',
                    'action_items': ['Investigate data sources', 'Review data collection processes', 'Implement data validation']
                })
        
        return recommendations
    
    def generate_dashboard_data(self):
        """Generate data for interactive dashboard"""
        dashboard_data = {
            'kpi_cards': self._generate_kpi_cards(),
            'charts': self._generate_charts(),
            'alerts': self._generate_alerts()
        }
        return dashboard_data
    
    def _generate_kpi_cards(self):
        """Generate KPI cards for dashboard"""
        cards = []
        
        if 'business_kpis' in self.insights:
            kpis = self.insights['business_kpis']
            
            for metric, value in kpis.items():
                if isinstance(value, (int, float)):
                    cards.append({
                        'title': metric.replace('_', ' ').title(),
                        'value': f"{value:,.2f}" if isinstance(value, float) else f"{value:,}",
                        'trend': 'up' if 'growth' in metric and value > 0 else 'down' if 'growth' in metric and value < 0 else 'neutral',
                        'color': 'green' if 'growth' in metric and value > 0 else 'red' if 'growth' in metric and value < 0 else 'blue'
                    })
        
        return cards
    
    def _generate_charts(self):
        """Generate chart data for dashboard"""
        charts = []
        numeric_data = self.data.select_dtypes(include=[np.number])
        
        # Time series chart
        if len(numeric_data.columns) > 0:
            for col in numeric_data.columns[:3]:  # Limit to first 3 columns
                series = numeric_data[col].dropna()
                if len(series) > 1:
                    charts.append({
                        'type': 'line',
                        'title': f'{col.replace("_", " ").title()} Over Time',
                        'data': {
                            'x': list(range(len(series))),
                            'y': series.tolist()
                        }
                    })
        
        return charts
    
    def _generate_alerts(self):
        """Generate alerts for dashboard"""
        alerts = []
        
        # Revenue alerts
        if 'business_kpis' in self.insights:
            kpis = self.insights['business_kpis']
            if 'revenue_growth' in kpis and kpis['revenue_growth'] < -10:
                alerts.append({
                    'type': 'warning',
                    'message': 'Revenue declining significantly',
                    'priority': 'high'
                })
        
        # Anomaly alerts
        if 'anomaly_detection' in self.insights:
            anomalies = self.insights['anomaly_detection']
            high_anomaly_count = sum(1 for data in anomalies.values() 
                                   if data['anomaly_percentage'] > 10)
            if high_anomaly_count > 0:
                alerts.append({
                    'type': 'error',
                    'message': f'{high_anomaly_count} columns have high anomaly rates',
                    'priority': 'medium'
                })
        
        return alerts 