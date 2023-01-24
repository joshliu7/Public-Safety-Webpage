/*
This file does pre-processing of the data and gets it ready for the bar chart and map. Those charts will call
functions in this file to get their data rather than going to the CSV directly. This file will add the category and color
based on the CATEGORIES mapping, and it also groups the crime data by incident for the bar chart.
 */

const CATEGORIES = {
  'INVESTIGATE' : {
    incidents: [
      'INVESTIGATE PERSON',
      'INVESTIGATE PROPERTY',
      'MISSING PERSON - LOCATED'
    ],
    color: '#5cd6f4'
  },
  'MEDICAL': {
    incidents: [
      'SICK ASSIST',
      'SICK/INJURED/MEDICAL - PERSON',
      'SICK ASSIST - DRUG RELATED ILLNESS',
      'SERVICE TO OTHER AGENCY'
    ],
    color: '#2e21d0'
  },
  'ASSAULT': {
    incidents:[
      'ASSAULT - SIMPLE',
      'ASSAULT - AGGRAVATED',
      'THREATS TO DO BODILY HARM'
    ],
    color: '#90286b'
  },
  'DRUGS': {
    incidents: [
      'DRUGS - POSSESSION/ SALE/ MANUFACTURING/ USE'
    ],
    color: '#a261f6'
  },
  'MOTOR VEHICLE': {
    incidents:[
      'VAL - VIOLATION OF AUTO LAW',
      'TOWED MOTOR VEHICLE',
      'M/V - LEAVING SCENE - PROPERTY DAMAGE',
      'M/V ACCIDENT - PROPERTY DAMAGE',
      'M/V ACCIDENT - PERSONAL INJURY',
      'M/V ACCIDENT - INVOLVING PEDESTRIAN - INJURY',
      'VAL - OPERATING AFTER REV/SUSP.'
    ],
    color: '#ad4f11'
  },
  'THEFT/VANDALISM': {
    incidents:[
      'LARCENY THEFT FROM BUILDING',
      'VANDALISM',
      'LARCENY SHOPLIFTING',
      'LARCENY THEFT FROM MV - NON-ACCESSORY',
      'LARCENY ALL OTHERS',
      'ROBBERY',
      'PROPERTY - LOST/ MISSING',
      'BURGLARY - RESIDENTIAL'
    ],
    color: '#60eea3'
  },
  'DISPUTE/HARASSMENT': {
    incidents:[
      'VERBAL DISPUTE',
      'HARASSMENT/ CRIMINAL HARASSMENT',
    ],
    color: '#4e834b'
  },
  'DEATH': {
    incidents:[
      'DEATH INVESTIGATION',
      'SUDDEN DEATH'
    ],
    color: '#f968c3'
  }
};

function getCategory(desc) {
  for (const [catName, catInfo] of Object.entries(CATEGORIES)) {
    if (catInfo.incidents.includes(desc)) {
      return catName;
    }
  }
  return '';
}

async function getBarData() {
  return new Promise((resolve, reject) => {
    d3.csv('crime2021_filtered.csv').then(data => {
      const incidentCountDict = data.reduce((result, d) => {
        const desc = d.OFFENSE_DESCRIPTION;
        const descDict = result[desc] || {
          description: desc,
          offenseCode: +d.OFFENSE_CODE,
          count: 0,
          category: getCategory(desc),
        };
        descDict.color = CATEGORIES[descDict.category]?.color;
        descDict.count++;
        result[desc] = descDict;
        return result;
      }, {});

      let barData = Object.values(incidentCountDict);
      barData.sort((a, b) => b.count - a.count);
      barData = barData.slice(0, 30);
      // put the offense codes into the CATEGORIES dict
      barData.forEach(incident => {
        CATEGORIES[incident.category].incidentCodes = CATEGORIES[incident.category].incidentCodes || [];
        CATEGORIES[incident.category].incidentCodes.push(incident.offenseCode);
      });
      console.log(CATEGORIES);
      return resolve(barData)
    }).catch(reject);
  });
}

async function getMapData() {
  return new Promise((resolve, reject) => {
    d3.csv('crime2021_filtered.csv').then(data => {
      const top30Descriptions = Object.values(CATEGORIES).map(catInfo => catInfo.incidents).flat();
      const mapData = data.filter(d => top30Descriptions.includes(d.OFFENSE_DESCRIPTION));
      mapData.forEach(d => {
        d.category = getCategory(d.OFFENSE_DESCRIPTION);
        d.color = CATEGORIES[d.category]?.color;
      });
      return resolve(mapData);
    }).catch(reject);
  });
}
