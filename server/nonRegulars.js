nonRegularLanguages = [
	//0n1n
	{
		_id: '0n1n',
		worldName: 'jungle',
		description: '0<sup>n</sup>1<sup>n</sup>',
		maxPointsGain: 10,
		pointsGain: 10,
		parsings: 
		{
			'0<sup><sup>p/2</sup></sup>1<sup><sup>p/2</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: ['xz has more 1s than 0s', 'xz has more 0s than 1s', 'xz has more 1s than 0s'],
					1: [],
					2: ['xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 1s than 0s']
				},
				'y has 0s and 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 1s after some 0s']
				},
				'y has only 1s':
				{
					0: ['xz has more 0s than 1s', 'xz has more 0s than 1s', 'xz has more 1s than 0s'],
					1: [],
					2: ['xy<sup>2</sup>z has more 1s than 0s', 'xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 1s than 0s']
				}
			},

			'0<sup><sup>p</sup></sup>1<sup><sup>p</sup></sup>': 
			{
				'y has only 0s':
				{
					0: ['xz has more 1s than 0s', 'xz has more 0s than 1s', 'xz has more 1s than 0s'],
					1: [],
					2: ['xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 1s than 0s']
				}
			}
		}
	},

	//0i1j, i < j
	{
		_id: '0i1ji<j',
		worldName: 'jungle',
		description: '0<sup>i</sup>1<sup>j</sup>, i < j',
		maxPointsGain: 20,
		pointsGain: 20,
		parsings: 
		{
			'0<sup><sup>p</sup></sup>1<sup><sup>2p</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: [],
					2: [],
					'p': ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s']
				}
			},

			'0<sup><sup>p</sup></sup>1<sup><sup>p+1</sup></sup>': 
			{
				'y has only 0s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s']
				}
			},

			'0<sup><sup>p-1</sup></sup>1<sup><sup>p</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s']
				},
				'y has 0s and 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 1s after some 0s']
				},
				'y has only 1s':
				{
					0: ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s'],
					1: [],
					2: []
				}
			}
		}
	},

		//0i1j, i > j
		{
		_id: '0i1ji>j',
		worldName: 'jungle',
		description: '0<sup>i</sup>1<sup>j</sup>, i > j',
		maxPointsGain: 20,
		pointsGain: 20,
		parsings: 
		{
			'0<sup><sup>p</sup></sup>1<sup><sup>p/2</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s'],
					2: [],
					'p': []
				}
			},

			'0<sup><sup>p</sup></sup>1<sup><sup>p-1</sup></sup>': 
			{
				'y has only 0s':
				{
					0: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s'],
					1: [],
					2: []
				}
			},

			'0<sup><sup>p-1</sup></sup>1<sup><sup>p-2</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s'],
					1: [],
					2: []
				},
				'y has 0s and 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 1s after some 0s']
				},
				'y has only 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s']
				}
			}
		}
	},

	//0m1m - temporary ocean language
	{
		_id: '0m1m',
		worldName: 'ocean',
		description: '0<sup>m</sup>1<sup>m</sup>',
		maxPointsGain: 10,
		pointsGain: 10,
		parsings: 
		{
			'0<sup><sup>p/2</sup></sup>1<sup><sup>p/2</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: ['xz has more 1s than 0s', 'xz has more 0s than 1s', 'xz has more 1s than 0s'],
					1: [],
					2: ['xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 1s than 0s']
				},
				'y has 0s and 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 1s after some 0s']
				},
				'y has only 1s':
				{
					0: ['xz has more 0s than 1s', 'xz has more 0s than 1s', 'xz has more 1s than 0s'],
					1: [],
					2: ['xy<sup>2</sup>z has more 1s than 0s', 'xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 1s than 0s']
				}
			},

			'0<sup><sup>p</sup></sup>1<sup><sup>p</sup></sup>': 
			{
				'y has only 0s':
				{
					0: ['xz has more 1s than 0s', 'xz has more 0s than 1s', 'xz has more 1s than 0s'],
					1: [],
					2: ['xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 1s than 0s']
				}
			}
		}
	},

	//0a1b, a < b
	{
		_id: '0a1ba<b',
		worldName: 'ocean',
		description: '0<sup>a</sup>1<sup>b</sup>, a < b',
		maxPointsGain: 20,
		pointsGain: 20,
		parsings: 
		{
			'0<sup><sup>p</sup></sup>1<sup><sup>2p</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: [],
					2: [],
					'p': ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s']
				}
			},

			'0<sup><sup>p</sup></sup>1<sup><sup>p+1</sup></sup>': 
			{
				'y has only 0s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s']
				}
			},

			'0<sup><sup>p-1</sup></sup>1<sup><sup>p</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s']
				},
				'y has 0s and 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 1s after some 0s']
				},
				'y has only 1s':
				{
					0: ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s'],
					1: [],
					2: []
				}
			}
		}
	},

	//0a1b, a > b
	{
		_id: '0a1ba>b',
		worldName: 'ocean',
		description: '0<sup>a</sup>1<sup>b</sup>, a > b',
		maxPointsGain: 20,
		pointsGain: 20,
		parsings: 
		{
			'0<sup><sup>p</sup></sup>1<sup><sup>p/2</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s'],
					2: [],
					'p': []
				}
			},

			'0<sup><sup>p</sup></sup>1<sup><sup>p-1</sup></sup>': 
			{
				'y has only 0s':
				{
					0: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s'],
					1: [],
					2: []
				}
			},

			'0<sup><sup>p-1</sup></sup>1<sup><sup>p-2</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s'],
					1: [],
					2: []
				},
				'y has 0s and 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 1s after some 0s']
				},
				'y has only 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s']
				}
			}
		}
	},

	//0k1k - temporary ice language
	{
		_id: '0k1k',
		worldName: 'ice',
		description: '0<sup>k</sup>1<sup>k</sup>',
		maxPointsGain: 10,
		pointsGain: 10,
		parsings: 
		{
			'0<sup><sup>p/2</sup></sup>1<sup><sup>p/2</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: ['xz has more 1s than 0s', 'xz has more 0s than 1s', 'xz has more 1s than 0s'],
					1: [],
					2: ['xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 1s than 0s']
				},
				'y has 0s and 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 1s after some 0s']
				},
				'y has only 1s':
				{
					0: ['xz has more 0s than 1s', 'xz has more 0s than 1s', 'xz has more 1s than 0s'],
					1: [],
					2: ['xy<sup>2</sup>z has more 1s than 0s', 'xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 1s than 0s']
				}
			},

			'0<sup><sup>p</sup></sup>1<sup><sup>p</sup></sup>': 
			{
				'y has only 0s':
				{
					0: ['xz has more 1s than 0s', 'xz has more 0s than 1s', 'xz has more 1s than 0s'],
					1: [],
					2: ['xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 0s than 1s', 'xy<sup>2</sup>z has more 1s than 0s']
				}
			}
		}
	},

	//0c1d, c < d
	{
		_id: '0c1dc<d',
		worldName: 'ice',
		description: '0<sup>c</sup>1<sup>d</sup>, c < d',
		maxPointsGain: 20,
		pointsGain: 20,
		parsings: 
		{
			'0<sup><sup>p</sup></sup>1<sup><sup>2p</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: [],
					2: [],
					'p': ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s']
				}
			},

			'0<sup><sup>p</sup></sup>1<sup><sup>p+1</sup></sup>': 
			{
				'y has only 0s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s']
				}
			},

			'0<sup><sup>p-1</sup></sup>1<sup><sup>p</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s']
				},
				'y has 0s and 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 1s after some 0s']
				},
				'y has only 1s':
				{
					0: ['xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 0s as 1s', 'xy<sup>2</sup>z has at least as many 1s as 0s'],
					1: [],
					2: []
				}
			}
		}
	},

	//0c1d, c > d
	{
		_id: '0c1dc>d',
		worldName: 'ice',
		description: '0<sup>c</sup>1<sup>d</sup>, c > d',
		maxPointsGain: 20,
		pointsGain: 20,
		parsings: 
		{
			'0<sup><sup>p</sup></sup>1<sup><sup>p/2</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s'],
					2: [],
					'p': []
				}
			},

			'0<sup><sup>p</sup></sup>1<sup><sup>p-1</sup></sup>': 
			{
				'y has only 0s':
				{
					0: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s'],
					1: [],
					2: []
				}
			},

			'0<sup><sup>p-1</sup></sup>1<sup><sup>p-2</sup></sup>': 
			{
				'y has only 0s': 
				{
					0: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s'],
					1: [],
					2: []
				},
				'y has 0s and 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 0s after some 1s', 'xy<sup>2</sup>z has some 1s after some 0s']
				},
				'y has only 1s':
				{
					0: [],
					1: [],
					2: ['xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 1s as 0s', 'xy<sup>2</sup>z has at least as many 0s as 1s']
				}
			}
		}
	},
];

