import { fontFamily } from '@mui/system';
import { theme } from '../theme/theme';

export const getCodingStandardsChartOption = (parameters: { dataSource: Array<Array<string | number | object>>; totalIssueCount: number; itemName: string; itemValue: string | number }) => {
	return {
		tooltip: {
			confine: true
		},
		dataset: {
			source: parameters.dataSource
		},
		series: [
			{
				type: 'pie',
				id: 'pie',
				radius: ['50%', '75%'],
				center: ['50%', '50%'],
				encode: {
					itemName: parameters.itemName,
					value: parameters.itemValue
				},
				itemStyle: {
					borderRadius: 5,
					borderColor: '#fff',
					borderWidth: 2
				},
				emphasis: {
					focus: 'self'
				},
				label: ''
			}
		],
		graphic: {
			type: 'group',
			left: 'center',
			top: 'center',
			children: [
				{
					type: 'text',
					id: 'text1',
					style: {
						text: parameters.totalIssueCount,
						textAlign: 'center',
						fontSize: '28px',
						fontWeight: 500,
						y: -16
					}
				},
				{
					type: 'text',
					id: 'text2',
					style: {
						text: 'Issues',
						textAlign: 'center',
						fontSize: '16px',
						fontWeight: 500,
						fontFamily:'Plus Jakarta Sans',
						fill: theme.palette.grey[500],
						y: 16
					}
				}
			]
		}
	};
};

export const getLanguagesDataChartOption = (parameters: { dataSource: Array<Array<string>>; itemName: string; itemValue: string | number }) => {
	return {
		tooltip: {},
		dataset: {
			source: parameters.dataSource
		},
		legend: {
			bottom: 4,
			left: 'center'
		},
		series: [
			{
				type: 'pie',
				id: 'pie',
				radius: '60%',
				center: ['50%', '50%'],
				encode: {
					itemName: parameters.itemName,
					value: parameters.itemValue
				},
				emphasis: {
					focus: 'self'
				},
				label: {
					formatter: '{d}%'
				}
			}
		]
	};
};
