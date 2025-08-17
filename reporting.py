import pandas as pd
import numpy as np
from datetime import datetime
import json
import os

class BusinessReporter:
    """
    Automated business reporting module for generating insights and reports.
    """
    
    def __init__(self, business_intelligence, config=None):
        self.bi = business_intelligence
        self.config = config or {}
        self.reports_dir = 'reports'
        os.makedirs(self.reports_dir, exist_ok=True)
        
    def generate_executive_summary(self):
        """Generate executive summary report"""
        insights = self.bi.insights
        
        summary = {
            'title': 'Business Intelligence Executive Summary',
            'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
            'overview': {
                'total_records': insights['data_overview']['total_records'],
                'total_columns': insights['data_overview']['total_columns'],
                'key_metrics_analyzed': len(insights['business_metrics'].get('business_kpis', {}))
            },
            'key_findings': self._extract_key_findings(),
            'business_impact': self._calculate_business_impact(),
            'recommendations': self._prioritize_recommendations(),
            'next_steps': self._generate_next_steps()
        }
        
        return summary
    
    def _extract_key_findings(self):
        """Extract key findings from analysis"""
        findings = []
        insights = self.bi.insights
        
        # Revenue findings
        if 'business_kpis' in insights:
            kpis = insights['business_kpis']
            if 'revenue_growth' in kpis:
                growth = kpis['revenue_growth']
                if growth > 0:
                    findings.append(f"✅ Revenue growing at {growth:.1f}%")
                else:
                    findings.append(f"⚠️ Revenue declining by {abs(growth):.1f}%")
        
        # Anomaly findings
        anomalies = insights.get('anomaly_detection', {})
        total_anomalies = sum(data['anomaly_count'] for data in anomalies.values())
        if total_anomalies > 0:
            findings.append(f"🔍 {total_anomalies} anomalies detected")
        
        # Trend findings
        trends = insights.get('trend_analysis', {})
        positive_trends = sum(1 for data in trends.values() if data['direction'] == 'increasing')
        if positive_trends > 0:
            findings.append(f"📈 {positive_trends} metrics showing positive trends")
        
        return findings
    
    def _calculate_business_impact(self):
        """Calculate business impact of findings"""
        impact = {
            'revenue_impact': 'Neutral',
            'risk_level': 'Low',
            'opportunity_score': 'Medium'
        }
        
        insights = self.bi.insights
        
        # Revenue impact
        if 'business_kpis' in insights:
            kpis = insights['business_kpis']
            if 'revenue_growth' in kpis:
                growth = kpis['revenue_growth']
                if growth < -10:
                    impact['revenue_impact'] = 'High Negative'
                    impact['risk_level'] = 'High'
                elif growth < 0:
                    impact['revenue_impact'] = 'Negative'
                    impact['risk_level'] = 'Medium'
                elif growth > 20:
                    impact['revenue_impact'] = 'High Positive'
                    impact['opportunity_score'] = 'High'
        
        return impact
    
    def _prioritize_recommendations(self):
        """Prioritize recommendations by business impact"""
        recommendations = self.bi.recommendations
        
        # Add priority scores
        for rec in recommendations:
            if rec['priority'] == 'High':
                rec['score'] = 3
            elif rec['priority'] == 'Medium':
                rec['score'] = 2
            else:
                rec['score'] = 1
        
        # Sort by priority score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return recommendations[:5]  # Top 5 recommendations
    
    def _generate_next_steps(self):
        """Generate actionable next steps"""
        steps = [
            {
                'step': 1,
                'action': 'Review and validate automated insights',
                'timeline': 'Immediate',
                'owner': 'Business Analyst'
            },
            {
                'step': 2,
                'action': 'Prioritize recommendations based on business impact',
                'timeline': 'This week',
                'owner': 'Management Team'
            },
            {
                'step': 3,
                'action': 'Implement high-priority data quality improvements',
                'timeline': 'Next 2 weeks',
                'owner': 'Data Team'
            }
        ]
        return steps
    
    def generate_detailed_report(self):
        """Generate detailed technical report"""
        insights = self.bi.insights
        
        report = {
            'title': 'Detailed Business Intelligence Report',
            'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
            'data_overview': insights['data_overview'],
            'business_metrics': insights['business_metrics'],
            'trend_analysis': insights['trend_analysis'],
            'anomaly_detection': insights['anomaly_detection'],
            'recommendations': self.bi.recommendations,
            'data_quality_assessment': self._assess_data_quality()
        }
        
        return report
    
    def _assess_data_quality(self):
        """Assess overall data quality"""
        data = self.bi.data
        overview = self.bi.insights['data_overview']
        
        quality_score = 100
        
        # Deduct points for missing data
        total_missing = sum(overview['missing_data'].values())
        missing_percentage = (total_missing / (len(data) * len(data.columns))) * 100
        quality_score -= missing_percentage * 2
        
        # Deduct points for anomalies
        anomalies = self.bi.insights.get('anomaly_detection', {})
        high_anomaly_count = sum(1 for data in anomalies.values() 
                               if data['anomaly_percentage'] > 10)
        quality_score -= high_anomaly_count * 5
        
        quality_score = max(0, quality_score)
        
        return {
            'overall_score': quality_score,
            'missing_data_percentage': missing_percentage,
            'high_anomaly_columns': high_anomaly_count,
            'quality_level': 'Excellent' if quality_score >= 90 else 'Good' if quality_score >= 70 else 'Fair' if quality_score >= 50 else 'Poor'
        }
    
    def save_report(self, report, filename=None):
        """Save report to file"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"business_report_{timestamp}.json"
        
        filepath = os.path.join(self.reports_dir, filename)
        
        with open(filepath, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        return filepath
    
    def generate_email_content(self, report_type='executive'):
        """Generate email content for reports"""
        if report_type == 'executive':
            report = self.generate_executive_summary()
            subject = f"Business Intelligence Executive Summary - {datetime.now().strftime('%Y-%m-%d')}"
        else:
            report = self.generate_detailed_report()
            subject = f"Detailed Business Intelligence Report - {datetime.now().strftime('%Y-%m-%d')}"
        
        content = f"""
        <html>
        <body>
            <h2>{report['title']}</h2>
            <p><strong>Date:</strong> {report['date']}</p>
            
            <h3>Key Findings</h3>
            <ul>
                {''.join([f'<li>{finding}</li>' for finding in report['key_findings']])}
            </ul>
            
            <h3>Top Recommendations</h3>
            <ol>
                {''.join([f'<li><strong>{rec["category"]}</strong>: {rec["recommendation"]}</li>' for rec in report['recommendations'][:3]])}
            </ol>
            
            <p><em>This report was automatically generated by the Business Intelligence System.</em></p>
        </body>
        </html>
        """
        
        return {
            'subject': subject,
            'content': content,
            'report': report
        } 