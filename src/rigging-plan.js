// Scaled from lighting.pdf. See reference/lighting-plan-trace.json for calibration.
export const RIGGING = {
  "source": "Corpus Playroom Lighting Plan, J. Evans, revision A, 17/04/18, page 1",
  "sourceFile": "lighting.pdf",
  "units": "mm",
  "coordinateSystem": "X right from shared audience corner; Y toward back wall",
  "calibration": {
    "originPdfBottomLeft": [
      188.7,
      827.819
    ],
    "xMillimetresPerPdfPoint": 10.648645881329033,
    "yMillimetresPerPdfPoint": 10.64144876026064,
    "referenceWidth": 4160,
    "referenceDepth": 5030
  },
  "accuracy": "Scaled from vector plan, not surveyed bar measurements. Patch markers show along-bar schematic locations; not luminaire or approved suspension positions.",
  "rearWallHeight": 2600,
  "barHeight": null,
  "removedCircuits": [
    21,
    22
  ],
  "floorCircuits": [
    43,
    44,
    45,
    46,
    47,
    48
  ],
  "bars": [
    {
      "id": "1-6",
      "circuits": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "a": {
        "x": -2253.466,
        "y": 95.773
      },
      "b": {
        "x": -2253.466,
        "y": 5121.304
      }
    },
    {
      "id": "7-12",
      "circuits": [
        7,
        8,
        9,
        10,
        11,
        12
      ],
      "a": {
        "x": -203.176,
        "y": 98.965
      },
      "b": {
        "x": -203.176,
        "y": 5128.327
      }
    },
    {
      "id": "13-18",
      "circuits": [
        13,
        14,
        15,
        16,
        17,
        18
      ],
      "a": {
        "x": 1700.163,
        "y": 97.05
      },
      "b": {
        "x": 1700.163,
        "y": 4978.283
      }
    },
    {
      "id": "19-24",
      "circuits": [
        19,
        20,
        23,
        24
      ],
      "a": {
        "x": 2502.006,
        "y": 100.242
      },
      "b": {
        "x": 2502.006,
        "y": 4954.659
      }
    },
    {
      "id": "25-30",
      "circuits": [
        25,
        26,
        27,
        28,
        29,
        30
      ],
      "a": {
        "x": 3804.761,
        "y": 74.064
      },
      "b": {
        "x": 3804.761,
        "y": 4754.812
      }
    },
    {
      "id": "31-36",
      "circuits": [
        31,
        32,
        33,
        34,
        35,
        36
      ],
      "a": {
        "x": 4643.661,
        "y": 199.208
      },
      "b": {
        "x": 99.032,
        "y": 199.208
      }
    },
    {
      "id": "37-42",
      "circuits": [
        37,
        38,
        39,
        40,
        41,
        42
      ],
      "a": {
        "x": 4658.357,
        "y": -695.312
      },
      "b": {
        "x": 97.116,
        "y": -695.312
      }
    }
  ],
  "patches": [
    {
      "circuit": 1,
      "bar": "1-6",
      "x": -2253.466,
      "y": 379.261
    },
    {
      "circuit": 2,
      "bar": "1-6",
      "x": -2253.466,
      "y": 1294.213
    },
    {
      "circuit": 3,
      "bar": "1-6",
      "x": -2253.466,
      "y": 2208.526
    },
    {
      "circuit": 4,
      "bar": "1-6",
      "x": -2253.466,
      "y": 3123.159
    },
    {
      "circuit": 5,
      "bar": "1-6",
      "x": -2253.466,
      "y": 4037.791
    },
    {
      "circuit": 6,
      "bar": "1-6",
      "x": -2253.466,
      "y": 4952.105
    },
    {
      "circuit": 7,
      "bar": "7-12",
      "x": -203.176,
      "y": 379.261
    },
    {
      "circuit": 8,
      "bar": "7-12",
      "x": -203.176,
      "y": 1294.213
    },
    {
      "circuit": 9,
      "bar": "7-12",
      "x": -203.176,
      "y": 2208.526
    },
    {
      "circuit": 10,
      "bar": "7-12",
      "x": -203.176,
      "y": 3123.159
    },
    {
      "circuit": 11,
      "bar": "7-12",
      "x": -203.176,
      "y": 4037.791
    },
    {
      "circuit": 12,
      "bar": "7-12",
      "x": -203.176,
      "y": 4952.105
    },
    {
      "circuit": 13,
      "bar": "13-18",
      "x": 1700.163,
      "y": 631.464
    },
    {
      "circuit": 14,
      "bar": "13-18",
      "x": 1700.163,
      "y": 1468.52
    },
    {
      "circuit": 15,
      "bar": "13-18",
      "x": 1700.163,
      "y": 2305.576
    },
    {
      "circuit": 16,
      "bar": "13-18",
      "x": 1700.163,
      "y": 3141.994
    },
    {
      "circuit": 17,
      "bar": "13-18",
      "x": 1700.163,
      "y": 3979.051
    },
    {
      "circuit": 18,
      "bar": "13-18",
      "x": 1700.163,
      "y": 4815.468
    },
    {
      "circuit": 19,
      "bar": "19-24",
      "x": 2502.006,
      "y": 631.464
    },
    {
      "circuit": 20,
      "bar": "19-24",
      "x": 2502.006,
      "y": 1468.52
    },
    {
      "circuit": 23,
      "bar": "19-24",
      "x": 2502.006,
      "y": 3979.051
    },
    {
      "circuit": 24,
      "bar": "19-24",
      "x": 2502.006,
      "y": 4815.468
    },
    {
      "circuit": 25,
      "bar": "25-30",
      "x": 3804.761,
      "y": 605.924
    },
    {
      "circuit": 26,
      "bar": "25-30",
      "x": 3804.761,
      "y": 1402.117
    },
    {
      "circuit": 27,
      "bar": "25-30",
      "x": 3804.761,
      "y": 2198.949
    },
    {
      "circuit": 28,
      "bar": "25-30",
      "x": 3804.761,
      "y": 2995.142
    },
    {
      "circuit": 29,
      "bar": "25-30",
      "x": 3804.761,
      "y": 3791.335
    },
    {
      "circuit": 30,
      "bar": "25-30",
      "x": 3804.761,
      "y": 4587.529
    },
    {
      "circuit": 31,
      "bar": "31-36",
      "x": 317.862,
      "y": 199.208
    },
    {
      "circuit": 32,
      "bar": "31-36",
      "x": 1092.871,
      "y": 199.208
    },
    {
      "circuit": 33,
      "bar": "31-36",
      "x": 1868.198,
      "y": 199.208
    },
    {
      "circuit": 34,
      "bar": "31-36",
      "x": 2643.526,
      "y": 199.208
    },
    {
      "circuit": 35,
      "bar": "31-36",
      "x": 3418.535,
      "y": 199.208
    },
    {
      "circuit": 36,
      "bar": "31-36",
      "x": 4193.863,
      "y": 199.208
    },
    {
      "circuit": 37,
      "bar": "37-42",
      "x": 317.862,
      "y": -695.312
    },
    {
      "circuit": 38,
      "bar": "37-42",
      "x": 1092.871,
      "y": -695.312
    },
    {
      "circuit": 39,
      "bar": "37-42",
      "x": 1868.198,
      "y": -695.312
    },
    {
      "circuit": 40,
      "bar": "37-42",
      "x": 2643.526,
      "y": -695.312
    },
    {
      "circuit": 41,
      "bar": "37-42",
      "x": 3418.535,
      "y": -695.312
    },
    {
      "circuit": 42,
      "bar": "37-42",
      "x": 4193.863,
      "y": -695.312
    }
  ]
};

// Projection onto the finite plan segment, in millimetres.
export function nearestBarPoint(point) {
  let nearest = null;
  for (const bar of RIGGING.bars) {
    const dx=bar.b.x-bar.a.x, dy=bar.b.y-bar.a.y;
    const t=Math.max(0,Math.min(1,((point.x-bar.a.x)*dx+(point.y-bar.a.y)*dy)/(dx*dx+dy*dy)));
    const x=bar.a.x+t*dx, y=bar.a.y+t*dy;
    const distance=Math.hypot(x-point.x,y-point.y);
    if (!nearest || distance<nearest.distance) nearest={bar:bar.id,x,y,distance,t};
  }
  return nearest;
}

// Two suspension ropes, with anchors along the sail's plan axis.
// Pickup positions scale with the anchor distances. This allows positive
// tensions to balance a centred load without a spurious sideways resultant.
export function suspensionLayout(model,sail,bars=RIGGING.bars) {
  const angle=sail.angle*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  const {clearance,bagHeight,tieLength,fabricHeight,battenLength}=sail.dimensions ?? model;
  const rise=model.riggingHeight-(clearance+bagHeight+tieLength+fabricHeight+15);
  const failure=reason=>({valid:false,reason,bars:[],ties:[],pickups:[],rise});
  if(rise<=0)return failure('Rigging must be above the upper-stick pickups.');
  const intersections=[];
  for(const bar of bars){
    const vx=bar.b.x-bar.a.x,vy=bar.b.y-bar.a.y;
    const den=c*vy-s*vx;
    if(Math.abs(den)<1e-7)continue;
    const dx=bar.a.x-sail.x,dy=bar.a.y-sail.y;
    const along=(dx*vy-dy*vx)/den,t=(dx*s-dy*c)/den;
    if(t<0||t>1||Math.abs(along)<1)continue;
    intersections.push({bar:bar.id,along,t,x:sail.x+along*c,y:sail.y+along*s});
  }
  let best=null;
  for(const low of intersections.filter(p=>p.along<0))for(const high of intersections.filter(p=>p.along>0)){
    if(low.bar===high.bar)continue;
    const span=high.along-low.along;
    if(!best||span<best.span)best={low,high,span};
  }
  if(!best)return failure('No two drawn bars surround this sail along its rotation. Move or rotate it to find a two-rope layout.');
  const {low,high,span}=best;
  // The outermost pickup is 10% in from its stick end. Keep the other
  // pickup in the same ratio as the anchors so force and moment balance.
  const scale=Math.min(.85,battenLength*.4/Math.max(-low.along,high.along));
  const ties=[low,high].map((anchor,i)=>{
    const localX=anchor.along*scale,from={x:sail.x+localX*c,y:sail.y+localX*s};
    const distance=Math.abs(anchor.along-localX),length=Math.hypot(rise,distance);
    const verticalLoad=i===0?high.along/span:-low.along/span;
    return {pickup:i,from,to:{bar:anchor.bar,x:anchor.x,y:anchor.y,distance,t:anchor.t},
      localX,anchorLocalX:anchor.along,anchorLocalZ:0,length,rise,
      angleFromHorizontal:Math.atan2(rise,distance)*180/Math.PI,
      verticalLoad,tensionRatio:verticalLoad*length/rise};
  });
  return {valid:true,reason:null,bars:[low.bar,high.bar],ties,
    pickups:ties.map(t=>({index:t.pickup,localX:t.localX,...t.from})),rise,span};
}
export function suspensionAnchors(model,sail){return suspensionLayout(model,sail).ties;}
