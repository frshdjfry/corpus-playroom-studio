// Original LOLA excerpt and blocking with five lighting looks from the updated rig.
export default {
  "format": "corpus-playroom-project",
  "version": 1,
  "title": "Sample Project",
  "model": {
    "version": 1,
    "fabricWidth": 1500,
    "fabricHeight": 1950,
    "battenLength": 1600,
    "tieLength": 150,
    "bagHeight": 150,
    "clearance": 50,
    "riggingHeight": 2800,
    "eyeHeight": 1200,
    "sails": [
      {
        "id": 2,
        "x": 3270,
        "y": 3668,
        "angle": -45,
        "closed": 0
      },
      {
        "id": 3,
        "x": 1200,
        "y": 1200,
        "angle": -45,
        "closed": 0
      },
      {
        "id": 4,
        "x": 3360,
        "y": 1200,
        "angle": -45,
        "closed": 0
      },
      {
        "id": 5,
        "x": 1080,
        "y": 3515,
        "angle": -45,
        "closed": 0
      }
    ],
    "lighting": {
      "mode": "theatre",
      "showCones": false,
      "ambient": 0.11,
      "fixtures": [
        {
          "id": 4,
          "name": "West Upstage LED Profile",
          "type": "spotjr",
          "bar": "1-6",
          "position": 0.9083354715797078,
          "enabled": true,
          "intensity": 0,
          "color": "#fbf7c6",
          "beam": 50,
          "softness": 0.28,
          "shadows": true,
          "aim": {
            "x": 62,
            "y": 3273,
            "height": 1200
          }
        },
        {
          "id": 9,
          "name": "West LED PAR",
          "type": "par",
          "bar": "1-6",
          "position": 0.44,
          "enabled": true,
          "intensity": 0,
          "color": "#c7f4ff",
          "beam": 60,
          "softness": 0.55,
          "shadows": true,
          "aim": {
            "x": 1351,
            "y": 1131,
            "height": 1200
          }
        },
        {
          "id": 7,
          "name": "West Downstage LED Profile",
          "type": "spotjr",
          "bar": "1-6",
          "position": 0.1,
          "enabled": true,
          "intensity": 0,
          "color": "#b3c9ff",
          "beam": 32,
          "softness": 0.12,
          "shadows": true,
          "aim": {
            "x": 52,
            "y": 706,
            "height": 1200
          }
        },
        {
          "id": 10,
          "name": "South Middle LED Profile",
          "type": "spotjr",
          "bar": "37-42",
          "position": 0.43,
          "enabled": true,
          "intensity": 0,
          "color": "#b8cdff",
          "beam": 32,
          "softness": 0.12,
          "shadows": true,
          "aim": {
            "x": 2990,
            "y": 2510,
            "height": 1200
          }
        },
        {
          "id": 8,
          "name": "South Right LED PAR",
          "type": "par",
          "bar": "37-42",
          "position": 0.18,
          "enabled": true,
          "intensity": 0,
          "color": "#ffc36b",
          "beam": 60,
          "softness": 0.55,
          "shadows": false,
          "aim": {
            "x": 2040,
            "y": 3180,
            "height": 1200
          }
        },
        {
          "id": 5,
          "name": "Centre Prelude · Orange gel",
          "type": "prelude",
          "bar": "19-24",
          "position": 0.51,
          "enabled": true,
          "intensity": 0,
          "color": "#ff7b00",
          "beam": 40,
          "softness": 0.12,
          "shadows": true,
          "aim": {
            "x": 2392,
            "y": 2696,
            "height": 0
          }
        },
        {
          "id": 11,
          "name": "Centre Prelude · Blue gel",
          "type": "prelude",
          "bar": "19-24",
          "position": 0.57,
          "enabled": true,
          "intensity": 0,
          "color": "#719cff",
          "beam": 40,
          "softness": 0.12,
          "shadows": true,
          "aim": {
            "x": 2392,
            "y": 2696,
            "height": 0
          }
        },
        {
          "id": 12,
          "name": "West Upstage Prelude",
          "type": "prelude",
          "bar": "7-12",
          "position": 0.9868665985127133,
          "enabled": true,
          "intensity": 0,
          "color": "#fff1d6",
          "beam": 32,
          "softness": 0.08,
          "shadows": true,
          "aim": {
            "x": 2374,
            "y": 3084,
            "height": 1200
          }
        },
        {
          "id": 13,
          "name": "Back Sails Fresnel ",
          "type": "acclaim",
          "bar": "25-30",
          "position": 0.8643238587088576,
          "enabled": true,
          "intensity": 65,
          "color": "#fff1d6",
          "beam": 60,
          "softness": 0.8,
          "shadows": true,
          "aim": {
            "x": 1349,
            "y": 1308,
            "height": 1200
          }
        }
      ]
    },
    "characters": [
      {
        "id": 1,
        "name": "Lola",
        "x": 3057,
        "y": 3443,
        "direction": -46,
        "height": 1650,
        "elevation": 180,
        "bodyColor": "#8d61c2",
        "jointColor": "#48a860",
        "pose": {
          "torso": [
            0,
            1,
            0
          ],
          "head": [
            0,
            1,
            0
          ],
          "left-upperArm": [
            0.2240174139018968,
            -0.9739887560952034,
            -0.034089606463332124
          ],
          "left-forearm": [
            0.10880428290861711,
            -0.9891298446237919,
            0.0989129844623792
          ],
          "left-thigh": [
            0.10432150855991194,
            -0.9935381767610661,
            0.044709217954247975
          ],
          "left-shin": [
            0.05486164878526202,
            -0.9974845233684003,
            -0.044886803551578015
          ],
          "right-upperArm": [
            -0.2240174139018968,
            -0.9739887560952034,
            -0.034089606463332124
          ],
          "right-forearm": [
            -0.10880428290861711,
            -0.9891298446237919,
            0.0989129844623792
          ],
          "right-thigh": [
            -0.10432150855991194,
            -0.9935381767610661,
            0.044709217954247975
          ],
          "right-shin": [
            -0.05486164878526202,
            -0.9974845233684003,
            -0.044886803551578015
          ]
        }
      },
      {
        "id": 2,
        "name": "Betty",
        "x": 1323,
        "y": 3758,
        "direction": -47,
        "height": 1650,
        "elevation": 0,
        "bodyColor": "#af4141",
        "jointColor": "#fff824",
        "pose": {
          "torso": [
            0,
            0.9950371902099893,
            0.09950371902099893
          ],
          "head": [
            0,
            1,
            0
          ],
          "left-upperArm": [
            0.11073202057883433,
            -0.9227668381569528,
            -0.36910673526278115
          ],
          "left-forearm": [
            0.07755667343294813,
            -0.9694584179118516,
            -0.23267002029884437
          ],
          "left-thigh": [
            0.05483626876013335,
            -0.9139378126688893,
            0.4021326375743113
          ],
          "left-shin": [
            0.019853622797734376,
            -0.9926811398867188,
            0.11912173678640625
          ],
          "right-upperArm": [
            -0.1388591297471342,
            -0.9257275316475615,
            0.3517764620260734
          ],
          "right-forearm": [
            -0.06941248035268513,
            -0.7932854897449728,
            0.6048801859305417
          ],
          "right-thigh": [
            -0.04653226875338139,
            -0.9306453750676277,
            -0.3629516962763748
          ],
          "right-shin": [
            -0.017956910222755067,
            -0.8978455111377533,
            -0.43994430045749916
          ]
        }
      },
      {
        "id": 3,
        "name": "Setti",
        "x": 3561,
        "y": 1615,
        "direction": -46,
        "height": 1650,
        "elevation": 0,
        "bodyColor": "#6174c2",
        "jointColor": "#58a848",
        "pose": {
          "torso": [
            0,
            0.9950371902099893,
            0.09950371902099893
          ],
          "head": [
            0,
            1,
            0
          ],
          "left-upperArm": [
            0.11073202057883433,
            -0.9227668381569528,
            -0.36910673526278115
          ],
          "left-forearm": [
            0.07755667343294813,
            -0.9694584179118516,
            -0.23267002029884437
          ],
          "left-thigh": [
            0.05483626876013335,
            -0.9139378126688893,
            0.4021326375743113
          ],
          "left-shin": [
            0.019853622797734376,
            -0.9926811398867188,
            0.11912173678640625
          ],
          "right-upperArm": [
            -0.1388591297471342,
            -0.9257275316475615,
            0.3517764620260734
          ],
          "right-forearm": [
            -0.06941248035268513,
            -0.7932854897449728,
            0.6048801859305417
          ],
          "right-thigh": [
            -0.04653226875338139,
            -0.9306453750676277,
            -0.3629516962763748
          ],
          "right-shin": [
            -0.017956910222755067,
            -0.8978455111377533,
            -0.43994430045749916
          ]
        }
      },
      {
        "id": 4,
        "name": "Sinn",
        "x": 1443,
        "y": 1532,
        "direction": -48,
        "height": 1850,
        "elevation": 0,
        "bodyColor": "#c29461",
        "jointColor": "#a77448",
        "pose": {
          "torso": [
            0,
            0.9950371902099893,
            0.09950371902099893
          ],
          "head": [
            0,
            1,
            0
          ],
          "left-upperArm": [
            0.11073202057883433,
            -0.9227668381569528,
            -0.36910673526278115
          ],
          "left-forearm": [
            0.07755667343294813,
            -0.9694584179118516,
            -0.23267002029884437
          ],
          "left-thigh": [
            0.05483626876013335,
            -0.9139378126688893,
            0.4021326375743113
          ],
          "left-shin": [
            0.019853622797734376,
            -0.9926811398867188,
            0.11912173678640625
          ],
          "right-upperArm": [
            -0.1388591297471342,
            -0.9257275316475615,
            0.3517764620260734
          ],
          "right-forearm": [
            -0.06941248035268513,
            -0.7932854897449728,
            0.6048801859305417
          ],
          "right-thigh": [
            -0.04653226875338139,
            -0.9306453750676277,
            -0.3629516962763748
          ],
          "right-shin": [
            -0.017956910222755067,
            -0.8978455111377533,
            -0.43994430045749916
          ]
        }
      }
    ],
    "props": [
      {
        "id": 1,
        "type": "box",
        "x": 502,
        "y": 554,
        "angle": 46,
        "elevation": 0,
        "color": "#9f8269",
        "dimensions": {
          "width": 600,
          "depth": 600,
          "height": 600
        }
      }
    ]
  },
  "script": {
    "raw": "A ship has docked.\nLOLA is sitting with her eyes fixated on the sea.\n.\n.\n.\n.\n.\n.\n.\n.\nTravelers approach her. \nBETTY\tWhere is this place?\nSINN\tIs there any food?\nSETTI\tWe’re lost.\nLOLA\tSilent.\nBETTY\tWhat are you saying?\nSINN\tDo you know our language?\nSETTI\tIn our tongue, being “silent” means consent.\nLOLA\tSilence.\nSINN\tSo, there’s food. We haven’t slept for three oceans. From hunger, from tempest.\nBETTY\tShe says “silence”.\nSETTI\tIn our tongue, “silence” is an order. Perhaps, she has a tribe.\nLOLA\tVacant.\nSINN\tWhat if they are cannibals?\nBETTY\tAre we allowed to be in the island?\nSETTI\tShe says “vacant”. The island is empty. She’s alone.\nLOLA\tVoid.\nSINN\tWhat can we eat here?\nBETTY\tAre you alone?\nSETTI\tWhat do you mean?\nLOLA\tNothing. I mean nothing. What can I mean by saying “void” after years of sitting on the shore of this forsaken island… without a ship? Sit. I haven’t seen humans for three ages.\nBETTY\tWhere have you come from?\nLOLA\tI’ve been here from the beginning.\nSINN\tParents?\nSETTI\tYou don’t talk like us.\nLOLA\tI’ve been here since I was young. Can’t recall before that.\nSINN\tHave you gone mad?\nLOLA\tDo you know fishing?\nSINN\tDon’t talk about it. \nThree travelers feel nausea.\nSETTI\tI can cook. Do you have fire?\nLOLA\tIt’s under your feet. Blow it. You must be hungry.\nBETTY\tFirst, sleep.\nLOLA\tDon’t sleep with empty stomach. It’ll turn to nightmare.\nSINN\tIs there any food except that sludge?\nLOLA\tNo. Fruits are still green. Birds haven’t arrived for breeding. Worms aren’t good for the stomach. And my flesh is bitter. There’s nothing to eat except for fish. (They feel nausea.) Although there’s some spice. \nBETTY\tOn fire. Maybe when it’s grilled. But its name. Don’t call it.\nLOLA\tNo, I haven’t gone mad.\nSINN\tI didn’t mean that.\nBETTY\tWhat’s wrong with your eyes?\nLOLA\tFixated?\nSINN\tWeird.\nLOLA\tStare!\nBETTY\tYour eyes… can they see?\nLOLA\tStare!\nSETTI\tStare at what?\nLOLA\tMy eyelids.\nSETTI\tHow do you not blink?\nBETTY\tShe doesn’t have eyelids.\nLOLA\tI do. (She brings out a wet cloth out of the water bucket and scrubs her eyes with it.) My bottom eyelid is the sea. Top one’s the sky. It rains a lot.\nSETTI\tWere you like this since the beginning?\nSINN\tFrom birth?\nLOLA\tNo… I cut them.\nSilence\nSINN\tOut of madness?\nLOLA\t(silent)\nBETTY\tWhere is your family?\nLOLA\tUnder your feet. Blow it. Where’re you coming from?\nSINN\tFrom the desert.\nLOLA\tWhere are you going?\nBETTY\tAnywhere.\nSETTI\tAn island with nice weather. Just like here.\nLOLA\tIt can’t be.\nSINN\tIs “can’t be” an order in your tongue?\nLOLA\tYou can’t. You won’t survive.\nSINN\tBut, there’s food.\nBETTY\tWho were your family?\nLOLA\tA jar of ash.\nBETTY\tBefore that?\nLOLA\tCan’t say. This is the first thing I remember. Sitting and crying with a jar full of ash in my hand. There was a pit beside me. I buried there.\nSETTI\tThen what?\nLOLA\tThen I was alone, don’t remember how many years. How many years, I don’t remember. Then there came a ship. Three people landed. They sat. Lit a fire. Ate fish. (Three of them feel nausea.) Slept. Awoke. Then left.\nSETTI\tJust like us?\nLOLA\tSomeone like you. Her name was Setti.\nSINN\tWhat?!\nLOLA\tSetti.\nSETTI\tMy name is Setti, too.\nBETTY\tHow odd!\nLOLA\tAnd someone like you. Her name was Betty?\nBETTY\tNo way!\nSINN\tHer name is Betty. It’s literally, Betty. How did you know?\nSETTI\tDid we say each other’s names?\nBETTY\tNo, we didn’t.\nSINN\tYes, we did.\nBETTY\tWe didn’t!\nSINN\tWe did!\nBETTY\tVote! Hands up for “We said our names”. \nOnly SINN raises her hand. But not SETTI and BETTY.\nSINN\tHow the hell does she know?\nLOLA\tDon’t be scared, Sinn. Sit.\nSINN sits down, confused. The three remain silent.\nSINN\tSetti, have we gone mad? She called me by name! Bbetty, say something!\nBETTY\tAre you a witch?\nSETTI\tOr a sage?\nLOLA\tI saw you in my dream.\nSINN\tAre you a seer?\nLOLA\tNot always.\nBETTY\tYou really sleep without eyelids?\nLOLA\tI don’t sleep. I daydream, sometimes. Best to sleep after fish. (Three of them feel nausea.) You’ll wake by sunrise. I saw it in my dream. You’ll board the ship, go back. But after a lifetime. With old age.\nSINN\tWhatever, how did you get our names?\nLOLA\tI guessed.\nBETTY\tThat’s impossible!\nLOLA\tHow so?\nSETTI\tThe chance is next to none.\nLOLA\tYou didn’t call each other by name, even in my dream. I just guessed. You had food. Slept. Had nightmares. Had food. Slept. Nightmares. Food. Slept. Then you knew this island’s dreams are all nightmares. You got scared. You left.\nSETTI\tEven right now, I’m scared. Let’s go away.\nLOLA\tFirst, Sinn’s lids would be cut out.\nBETTY\tImpossible!\nSETTI\tIt hurts so much that it can’t be possible.\nLOLA \tWhat if I tell you sleeping in here hurts even more?\nSINN\tYou’re absolutely mad. But you know some witchcraft… that tells you our names. But not more than that!\nLOLA\tSilence!\nBETTY\tYou haven’t cut the lids out of your eyes. You’ve been tortured.\nLOLA\tThen you’ll cut them out.\nSETTI\tI could never do that.\nLOLA\tBut you won’t cut it at last. You’ll ask me to do it. (She goes away.)\nSETTI\tSinn, let’s go. It’s so horrible.\nSINN\tShe just wants to scare us.\nBETTY\tWhat if she’s telling the truth.\nSINN\tWe sleep. If she’s right, then we’d leave.\nSETTI\tWhat about the sea? How can we find the way? What to eat? How would we sleep over the waves?\nSINN\tShe’s not telling the truth. I say we’ll stay here and never cut out our lids.\nBETTY\tHow was the food?\nSETTI\tMuch better when it’s cooked.\nSINN\tTime to sleep.\nSETTI\tWhat about the nightmare?\nSINN\tDon’t believe her!\nLOLA\t(From distance) You’ll believe me after you wake up. It’s been a long time since you last slept. Sleep tight. The sky is clear tonight.\nSINN\tI’m going to sleep now.\nSETTI\tNo, we shouldn’t.\nBETTY\tLet’s vote. Hands up for “Sleep”. (SINN starts to snore.) Sleep Setti. Don’t be afraid. (BETTY and SETTI fall asleep too.)\nLOLA\tShhhhhhh… Sleep… at peace… your eyes will keep shut as long as a blink. But you’ll dream the longest nightmare of your life. You’ll wake up out of fear.\nSINN\tNo! \nThree of them wake up.\nLOLA\tNothing. You’ll say nothing. You’ll believe me. Nothing. You’ll want nothing… but to be rid of those nightmares. \nThey recall few sentences of their nightmares.\nSINN\tSilent. \nSETTI\tSilence.\nBETTY\tVacant.\nLOLA\tI hope you won’t be a dream this time. You get up. Board the ship. And leave.\nSINN\tCut it out, Lola.\nLOLA\tHow did you get my name?\nBETTY\tCut it out, Lolita.\nLOLA\tDid you guess?\nSETTI\tThirteen-year-old Lolita.\nLOLA\tBut you’re tired. You fall asleep without knowing it. (They close their lids.) But again, you wake up in fright.\nBETTY\tNo! \nThey all wake up.\nLOLA\tYou sleep again. Wake up again… Sleep… Wake… until you start to beg. You want to cut off your lids. \nThree travelers sleep and wake again and again.\nSINN\tCut it out. I don’t want to sleep anymore.\nLOLA\tSo, in the name of the mother, daughter, and lust, I pronounce you a citizen of this state. You should know its laws by heart. You should learn its history. And for its sake, you should offer not your life but your eyelids instead.\nSINN\tI’m ready.\nLOLA\tSo know after the cut, you crave more sleep, from pain. But you can’t. Vertigo reaches the top. Then you free-fall to the numbness.\nSETTI\tI’m ready.\t       \nLOLA\tNumbness is the first reward. Pain isn’t beneath your skin. It’s in front of you. Sounds turn slow (Sounds turn slow.) until you hear raving.\nBETTY\tCut it out.\nLOLA\tUntil you rave in delirium. Shortly after, you cross the border to the other side. You sleep. But you don’t recall the nightmare, even if you had one.\nSINN\tI feel sleepy.\nLOLA\tYour eyes are constant. Constantly dry. You wet them. With sea water. They grow drier, salt crusting over. They crack.\nSETTI\tI can’t stand wakefulness.\nLOLA\tYou can’t stand watchfulness. You’re nonexistent. Miles of nonexistence. Nonexistent for miles. You see the mirage of a mirage of mirage.\nBETTY\tWe’re ready, Lola. Cut them out.",
    "lines": [
      {
        "id": "line-1",
        "text": "A ship has docked."
      },
      {
        "id": "line-2",
        "text": "LOLA is sitting with her eyes fixated on the sea."
      },
      {
        "id": "line-1722",
        "text": "."
      },
      {
        "id": "line-1725",
        "text": "."
      },
      {
        "id": "line-1726",
        "text": "."
      },
      {
        "id": "line-1727",
        "text": "."
      },
      {
        "id": "line-1728",
        "text": "."
      },
      {
        "id": "line-1729",
        "text": "."
      },
      {
        "id": "line-1730",
        "text": "."
      },
      {
        "id": "line-1731",
        "text": "."
      },
      {
        "id": "line-3",
        "text": "Travelers approach her. "
      },
      {
        "id": "line-4",
        "text": "BETTY\tWhere is this place?"
      },
      {
        "id": "line-5",
        "text": "SINN\tIs there any food?"
      },
      {
        "id": "line-6",
        "text": "SETTI\tWe’re lost."
      },
      {
        "id": "line-7",
        "text": "LOLA\tSilent."
      },
      {
        "id": "line-8",
        "text": "BETTY\tWhat are you saying?"
      },
      {
        "id": "line-9",
        "text": "SINN\tDo you know our language?"
      },
      {
        "id": "line-10",
        "text": "SETTI\tIn our tongue, being “silent” means consent."
      },
      {
        "id": "line-11",
        "text": "LOLA\tSilence."
      },
      {
        "id": "line-12",
        "text": "SINN\tSo, there’s food. We haven’t slept for three oceans. From hunger, from tempest."
      },
      {
        "id": "line-13",
        "text": "BETTY\tShe says “silence”."
      },
      {
        "id": "line-14",
        "text": "SETTI\tIn our tongue, “silence” is an order. Perhaps, she has a tribe."
      },
      {
        "id": "line-15",
        "text": "LOLA\tVacant."
      },
      {
        "id": "line-16",
        "text": "SINN\tWhat if they are cannibals?"
      },
      {
        "id": "line-17",
        "text": "BETTY\tAre we allowed to be in the island?"
      },
      {
        "id": "line-18",
        "text": "SETTI\tShe says “vacant”. The island is empty. She’s alone."
      },
      {
        "id": "line-19",
        "text": "LOLA\tVoid."
      },
      {
        "id": "line-20",
        "text": "SINN\tWhat can we eat here?"
      },
      {
        "id": "line-21",
        "text": "BETTY\tAre you alone?"
      },
      {
        "id": "line-22",
        "text": "SETTI\tWhat do you mean?"
      },
      {
        "id": "line-23",
        "text": "LOLA\tNothing. I mean nothing. What can I mean by saying “void” after years of sitting on the shore of this forsaken island… without a ship? Sit. I haven’t seen humans for three ages."
      },
      {
        "id": "line-24",
        "text": "BETTY\tWhere have you come from?"
      },
      {
        "id": "line-25",
        "text": "LOLA\tI’ve been here from the beginning."
      },
      {
        "id": "line-26",
        "text": "SINN\tParents?"
      },
      {
        "id": "line-27",
        "text": "SETTI\tYou don’t talk like us."
      },
      {
        "id": "line-28",
        "text": "LOLA\tI’ve been here since I was young. Can’t recall before that."
      },
      {
        "id": "line-29",
        "text": "SINN\tHave you gone mad?"
      },
      {
        "id": "line-30",
        "text": "LOLA\tDo you know fishing?"
      },
      {
        "id": "line-31",
        "text": "SINN\tDon’t talk about it. "
      },
      {
        "id": "line-32",
        "text": "Three travelers feel nausea."
      },
      {
        "id": "line-33",
        "text": "SETTI\tI can cook. Do you have fire?"
      },
      {
        "id": "line-34",
        "text": "LOLA\tIt’s under your feet. Blow it. You must be hungry."
      },
      {
        "id": "line-35",
        "text": "BETTY\tFirst, sleep."
      },
      {
        "id": "line-36",
        "text": "LOLA\tDon’t sleep with empty stomach. It’ll turn to nightmare."
      },
      {
        "id": "line-37",
        "text": "SINN\tIs there any food except that sludge?"
      },
      {
        "id": "line-38",
        "text": "LOLA\tNo. Fruits are still green. Birds haven’t arrived for breeding. Worms aren’t good for the stomach. And my flesh is bitter. There’s nothing to eat except for fish. (They feel nausea.) Although there’s some spice. "
      },
      {
        "id": "line-39",
        "text": "BETTY\tOn fire. Maybe when it’s grilled. But its name. Don’t call it."
      },
      {
        "id": "line-40",
        "text": "LOLA\tNo, I haven’t gone mad."
      },
      {
        "id": "line-41",
        "text": "SINN\tI didn’t mean that."
      },
      {
        "id": "line-42",
        "text": "BETTY\tWhat’s wrong with your eyes?"
      },
      {
        "id": "line-43",
        "text": "LOLA\tFixated?"
      },
      {
        "id": "line-44",
        "text": "SINN\tWeird."
      },
      {
        "id": "line-45",
        "text": "LOLA\tStare!"
      },
      {
        "id": "line-46",
        "text": "BETTY\tYour eyes… can they see?"
      },
      {
        "id": "line-47",
        "text": "LOLA\tStare!"
      },
      {
        "id": "line-48",
        "text": "SETTI\tStare at what?"
      },
      {
        "id": "line-49",
        "text": "LOLA\tMy eyelids."
      },
      {
        "id": "line-50",
        "text": "SETTI\tHow do you not blink?"
      },
      {
        "id": "line-51",
        "text": "BETTY\tShe doesn’t have eyelids."
      },
      {
        "id": "line-52",
        "text": "LOLA\tI do. (She brings out a wet cloth out of the water bucket and scrubs her eyes with it.) My bottom eyelid is the sea. Top one’s the sky. It rains a lot."
      },
      {
        "id": "line-53",
        "text": "SETTI\tWere you like this since the beginning?"
      },
      {
        "id": "line-54",
        "text": "SINN\tFrom birth?"
      },
      {
        "id": "line-55",
        "text": "LOLA\tNo… I cut them."
      },
      {
        "id": "line-56",
        "text": "Silence"
      },
      {
        "id": "line-57",
        "text": "SINN\tOut of madness?"
      },
      {
        "id": "line-58",
        "text": "LOLA\t(silent)"
      },
      {
        "id": "line-59",
        "text": "BETTY\tWhere is your family?"
      },
      {
        "id": "line-60",
        "text": "LOLA\tUnder your feet. Blow it. Where’re you coming from?"
      },
      {
        "id": "line-61",
        "text": "SINN\tFrom the desert."
      },
      {
        "id": "line-62",
        "text": "LOLA\tWhere are you going?"
      },
      {
        "id": "line-63",
        "text": "BETTY\tAnywhere."
      },
      {
        "id": "line-64",
        "text": "SETTI\tAn island with nice weather. Just like here."
      },
      {
        "id": "line-65",
        "text": "LOLA\tIt can’t be."
      },
      {
        "id": "line-66",
        "text": "SINN\tIs “can’t be” an order in your tongue?"
      },
      {
        "id": "line-67",
        "text": "LOLA\tYou can’t. You won’t survive."
      },
      {
        "id": "line-68",
        "text": "SINN\tBut, there’s food."
      },
      {
        "id": "line-69",
        "text": "BETTY\tWho were your family?"
      },
      {
        "id": "line-70",
        "text": "LOLA\tA jar of ash."
      },
      {
        "id": "line-71",
        "text": "BETTY\tBefore that?"
      },
      {
        "id": "line-72",
        "text": "LOLA\tCan’t say. This is the first thing I remember. Sitting and crying with a jar full of ash in my hand. There was a pit beside me. I buried there."
      },
      {
        "id": "line-73",
        "text": "SETTI\tThen what?"
      },
      {
        "id": "line-74",
        "text": "LOLA\tThen I was alone, don’t remember how many years. How many years, I don’t remember. Then there came a ship. Three people landed. They sat. Lit a fire. Ate fish. (Three of them feel nausea.) Slept. Awoke. Then left."
      },
      {
        "id": "line-75",
        "text": "SETTI\tJust like us?"
      },
      {
        "id": "line-76",
        "text": "LOLA\tSomeone like you. Her name was Setti."
      },
      {
        "id": "line-77",
        "text": "SINN\tWhat?!"
      },
      {
        "id": "line-78",
        "text": "LOLA\tSetti."
      },
      {
        "id": "line-79",
        "text": "SETTI\tMy name is Setti, too."
      },
      {
        "id": "line-80",
        "text": "BETTY\tHow odd!"
      },
      {
        "id": "line-81",
        "text": "LOLA\tAnd someone like you. Her name was Betty?"
      },
      {
        "id": "line-82",
        "text": "BETTY\tNo way!"
      },
      {
        "id": "line-83",
        "text": "SINN\tHer name is Betty. It’s literally, Betty. How did you know?"
      },
      {
        "id": "line-84",
        "text": "SETTI\tDid we say each other’s names?"
      },
      {
        "id": "line-85",
        "text": "BETTY\tNo, we didn’t."
      },
      {
        "id": "line-86",
        "text": "SINN\tYes, we did."
      },
      {
        "id": "line-87",
        "text": "BETTY\tWe didn’t!"
      },
      {
        "id": "line-88",
        "text": "SINN\tWe did!"
      },
      {
        "id": "line-89",
        "text": "BETTY\tVote! Hands up for “We said our names”. "
      },
      {
        "id": "line-90",
        "text": "Only SINN raises her hand. But not SETTI and BETTY."
      },
      {
        "id": "line-91",
        "text": "SINN\tHow the hell does she know?"
      },
      {
        "id": "line-92",
        "text": "LOLA\tDon’t be scared, Sinn. Sit."
      },
      {
        "id": "line-93",
        "text": "SINN sits down, confused. The three remain silent."
      },
      {
        "id": "line-94",
        "text": "SINN\tSetti, have we gone mad? She called me by name! Bbetty, say something!"
      },
      {
        "id": "line-95",
        "text": "BETTY\tAre you a witch?"
      },
      {
        "id": "line-96",
        "text": "SETTI\tOr a sage?"
      },
      {
        "id": "line-97",
        "text": "LOLA\tI saw you in my dream."
      },
      {
        "id": "line-98",
        "text": "SINN\tAre you a seer?"
      },
      {
        "id": "line-99",
        "text": "LOLA\tNot always."
      },
      {
        "id": "line-100",
        "text": "BETTY\tYou really sleep without eyelids?"
      },
      {
        "id": "line-101",
        "text": "LOLA\tI don’t sleep. I daydream, sometimes. Best to sleep after fish. (Three of them feel nausea.) You’ll wake by sunrise. I saw it in my dream. You’ll board the ship, go back. But after a lifetime. With old age."
      },
      {
        "id": "line-102",
        "text": "SINN\tWhatever, how did you get our names?"
      },
      {
        "id": "line-103",
        "text": "LOLA\tI guessed."
      },
      {
        "id": "line-104",
        "text": "BETTY\tThat’s impossible!"
      },
      {
        "id": "line-105",
        "text": "LOLA\tHow so?"
      },
      {
        "id": "line-106",
        "text": "SETTI\tThe chance is next to none."
      },
      {
        "id": "line-107",
        "text": "LOLA\tYou didn’t call each other by name, even in my dream. I just guessed. You had food. Slept. Had nightmares. Had food. Slept. Nightmares. Food. Slept. Then you knew this island’s dreams are all nightmares. You got scared. You left."
      },
      {
        "id": "line-108",
        "text": "SETTI\tEven right now, I’m scared. Let’s go away."
      },
      {
        "id": "line-109",
        "text": "LOLA\tFirst, Sinn’s lids would be cut out."
      },
      {
        "id": "line-110",
        "text": "BETTY\tImpossible!"
      },
      {
        "id": "line-111",
        "text": "SETTI\tIt hurts so much that it can’t be possible."
      },
      {
        "id": "line-112",
        "text": "LOLA \tWhat if I tell you sleeping in here hurts even more?"
      },
      {
        "id": "line-113",
        "text": "SINN\tYou’re absolutely mad. But you know some witchcraft… that tells you our names. But not more than that!"
      },
      {
        "id": "line-114",
        "text": "LOLA\tSilence!"
      },
      {
        "id": "line-115",
        "text": "BETTY\tYou haven’t cut the lids out of your eyes. You’ve been tortured."
      },
      {
        "id": "line-116",
        "text": "LOLA\tThen you’ll cut them out."
      },
      {
        "id": "line-117",
        "text": "SETTI\tI could never do that."
      },
      {
        "id": "line-118",
        "text": "LOLA\tBut you won’t cut it at last. You’ll ask me to do it. (She goes away.)"
      },
      {
        "id": "line-119",
        "text": "SETTI\tSinn, let’s go. It’s so horrible."
      },
      {
        "id": "line-120",
        "text": "SINN\tShe just wants to scare us."
      },
      {
        "id": "line-121",
        "text": "BETTY\tWhat if she’s telling the truth."
      },
      {
        "id": "line-122",
        "text": "SINN\tWe sleep. If she’s right, then we’d leave."
      },
      {
        "id": "line-123",
        "text": "SETTI\tWhat about the sea? How can we find the way? What to eat? How would we sleep over the waves?"
      },
      {
        "id": "line-124",
        "text": "SINN\tShe’s not telling the truth. I say we’ll stay here and never cut out our lids."
      },
      {
        "id": "line-125",
        "text": "BETTY\tHow was the food?"
      },
      {
        "id": "line-126",
        "text": "SETTI\tMuch better when it’s cooked."
      },
      {
        "id": "line-127",
        "text": "SINN\tTime to sleep."
      },
      {
        "id": "line-128",
        "text": "SETTI\tWhat about the nightmare?"
      },
      {
        "id": "line-129",
        "text": "SINN\tDon’t believe her!"
      },
      {
        "id": "line-130",
        "text": "LOLA\t(From distance) You’ll believe me after you wake up. It’s been a long time since you last slept. Sleep tight. The sky is clear tonight."
      },
      {
        "id": "line-131",
        "text": "SINN\tI’m going to sleep now."
      },
      {
        "id": "line-132",
        "text": "SETTI\tNo, we shouldn’t."
      },
      {
        "id": "line-133",
        "text": "BETTY\tLet’s vote. Hands up for “Sleep”. (SINN starts to snore.) Sleep Setti. Don’t be afraid. (BETTY and SETTI fall asleep too.)"
      },
      {
        "id": "line-134",
        "text": "LOLA\tShhhhhhh… Sleep… at peace… your eyes will keep shut as long as a blink. But you’ll dream the longest nightmare of your life. You’ll wake up out of fear."
      },
      {
        "id": "line-135",
        "text": "SINN\tNo! "
      },
      {
        "id": "line-136",
        "text": "Three of them wake up."
      },
      {
        "id": "line-137",
        "text": "LOLA\tNothing. You’ll say nothing. You’ll believe me. Nothing. You’ll want nothing… but to be rid of those nightmares. "
      },
      {
        "id": "line-138",
        "text": "They recall few sentences of their nightmares."
      },
      {
        "id": "line-139",
        "text": "SINN\tSilent. "
      },
      {
        "id": "line-140",
        "text": "SETTI\tSilence."
      },
      {
        "id": "line-141",
        "text": "BETTY\tVacant."
      },
      {
        "id": "line-142",
        "text": "LOLA\tI hope you won’t be a dream this time. You get up. Board the ship. And leave."
      },
      {
        "id": "line-143",
        "text": "SINN\tCut it out, Lola."
      },
      {
        "id": "line-144",
        "text": "LOLA\tHow did you get my name?"
      },
      {
        "id": "line-145",
        "text": "BETTY\tCut it out, Lolita."
      },
      {
        "id": "line-146",
        "text": "LOLA\tDid you guess?"
      },
      {
        "id": "line-147",
        "text": "SETTI\tThirteen-year-old Lolita."
      },
      {
        "id": "line-148",
        "text": "LOLA\tBut you’re tired. You fall asleep without knowing it. (They close their lids.) But again, you wake up in fright."
      },
      {
        "id": "line-149",
        "text": "BETTY\tNo! "
      },
      {
        "id": "line-150",
        "text": "They all wake up."
      },
      {
        "id": "line-151",
        "text": "LOLA\tYou sleep again. Wake up again… Sleep… Wake… until you start to beg. You want to cut off your lids. "
      },
      {
        "id": "line-152",
        "text": "Three travelers sleep and wake again and again."
      },
      {
        "id": "line-153",
        "text": "SINN\tCut it out. I don’t want to sleep anymore."
      },
      {
        "id": "line-154",
        "text": "LOLA\tSo, in the name of the mother, daughter, and lust, I pronounce you a citizen of this state. You should know its laws by heart. You should learn its history. And for its sake, you should offer not your life but your eyelids instead."
      },
      {
        "id": "line-155",
        "text": "SINN\tI’m ready."
      },
      {
        "id": "line-156",
        "text": "LOLA\tSo know after the cut, you crave more sleep, from pain. But you can’t. Vertigo reaches the top. Then you free-fall to the numbness."
      },
      {
        "id": "line-157",
        "text": "SETTI\tI’m ready.\t       "
      },
      {
        "id": "line-158",
        "text": "LOLA\tNumbness is the first reward. Pain isn’t beneath your skin. It’s in front of you. Sounds turn slow (Sounds turn slow.) until you hear raving."
      },
      {
        "id": "line-159",
        "text": "BETTY\tCut it out."
      },
      {
        "id": "line-160",
        "text": "LOLA\tUntil you rave in delirium. Shortly after, you cross the border to the other side. You sleep. But you don’t recall the nightmare, even if you had one."
      },
      {
        "id": "line-161",
        "text": "SINN\tI feel sleepy."
      },
      {
        "id": "line-162",
        "text": "LOLA\tYour eyes are constant. Constantly dry. You wet them. With sea water. They grow drier, salt crusting over. They crack."
      },
      {
        "id": "line-163",
        "text": "SETTI\tI can’t stand wakefulness."
      },
      {
        "id": "line-164",
        "text": "LOLA\tYou can’t stand watchfulness. You’re nonexistent. Miles of nonexistence. Nonexistent for miles. You see the mirage of a mirage of mirage."
      },
      {
        "id": "line-165",
        "text": "BETTY\tWe’re ready, Lola. Cut them out."
      }
    ]
  },
  "rehearsal": {
    "version": 1,
    "scenes": [
      {
        "moment": "line-1",
        "title": "Island — Arrival"
      },
      {
        "moment": "line-133",
        "title": "Island — The first sleep"
      }
    ],
    "tracks": {
      "set": [],
      "lighting": [
        {
          "moment": "line-1",
          "label": "Back sails Fresnel",
          "duration": 0,
          "target": {
            "mode": "theatre",
            "ambient": 0.11,
            "fixtures": {}
          }
        }
      ]
    },
    "keyframes": {
      "sail:2:raise": [
        {
          "time": 59.3,
          "value": 0,
          "curve": "linear"
        },
        {
          "time": 84.9,
          "value": 0.99,
          "curve": "linear"
        },
        {
          "time": 206.4,
          "value": 1,
          "curve": "hold"
        },
        {
          "time": 214.6,
          "value": 0,
          "curve": "linear"
        }
      ],
      "sail:3:raise": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 49.6,
          "value": 0,
          "curve": "linear"
        },
        {
          "time": 78,
          "value": 1,
          "curve": "linear"
        },
        {
          "time": 429.3,
          "value": 1,
          "curve": "linear"
        },
        {
          "time": 433.3,
          "value": 0,
          "curve": "linear"
        },
        {
          "time": 448.9,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 451.9,
          "value": 1,
          "curve": "linear"
        },
        {
          "time": 484.9,
          "value": 1,
          "curve": "hold"
        },
        {
          "time": 487.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "sail:4:raise": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 49.6,
          "value": 0,
          "curve": "linear"
        },
        {
          "time": 79.5,
          "value": 1,
          "curve": "linear"
        },
        {
          "time": 484.9,
          "value": 1,
          "curve": "hold"
        },
        {
          "time": 487.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "sail:5:raise": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 49.6,
          "value": 0,
          "curve": "linear"
        },
        {
          "time": 79.5,
          "value": 1,
          "curve": "linear"
        },
        {
          "time": 484.9,
          "value": 1,
          "curve": "hold"
        },
        {
          "time": 487.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "character:1:position": [
        {
          "time": 0,
          "value": {
            "x": 3834,
            "y": 4102
          },
          "curve": "linear"
        },
        {
          "time": 63,
          "value": {
            "x": 3799,
            "y": 4256
          },
          "curve": "linear"
        },
        {
          "time": 105.1,
          "value": {
            "x": 3057,
            "y": 3443
          },
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": {
            "x": 3057,
            "y": 3443
          },
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": {
            "x": 2392,
            "y": 3396
          },
          "curve": "linear"
        }
      ],
      "character:2:position": [
        {
          "time": 72.1,
          "value": {
            "x": 1323,
            "y": 3758
          },
          "curve": "linear"
        },
        {
          "time": 299.2,
          "value": {
            "x": 701,
            "y": 1364
          },
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": {
            "x": 701,
            "y": 1364
          },
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": {
            "x": 1692,
            "y": 2696
          },
          "curve": "linear"
        }
      ],
      "character:2:direction": [
        {
          "time": 72.1,
          "value": 99,
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": 99,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 90,
          "curve": "linear"
        }
      ],
      "character:2:pose": [
        {
          "time": 57.1,
          "value": {
            "torso": [
              0,
              0.9950371902099893,
              0.09950371902099893
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.11073202057883433,
              -0.9227668381569528,
              -0.36910673526278115
            ],
            "left-forearm": [
              0.07755667343294813,
              -0.9694584179118516,
              -0.23267002029884437
            ],
            "left-thigh": [
              0.05483626876013335,
              -0.9139378126688893,
              0.4021326375743113
            ],
            "left-shin": [
              0.019853622797734376,
              -0.9926811398867188,
              0.11912173678640625
            ],
            "right-upperArm": [
              -0.1388591297471342,
              -0.9257275316475615,
              0.3517764620260734
            ],
            "right-forearm": [
              -0.06941248035268513,
              -0.7932854897449728,
              0.6048801859305417
            ],
            "right-thigh": [
              -0.04653226875338139,
              -0.9306453750676277,
              -0.3629516962763748
            ],
            "right-shin": [
              -0.017956910222755067,
              -0.8978455111377533,
              -0.43994430045749916
            ]
          },
          "curve": "linear"
        },
        {
          "time": 72.1,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "linear"
        },
        {
          "time": 299.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "linear"
        },
        {
          "time": 468.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "hold"
        },
        {
          "time": 471.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "linear"
        }
      ],
      "character:3:position": [
        {
          "time": 72.1,
          "value": {
            "x": 3561,
            "y": 1615
          },
          "curve": "linear"
        },
        {
          "time": 299.2,
          "value": {
            "x": 1283,
            "y": 663
          },
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": {
            "x": 1283,
            "y": 663
          },
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": {
            "x": 3092,
            "y": 2696
          },
          "curve": "linear"
        }
      ],
      "character:3:direction": [
        {
          "time": 72.1,
          "value": 180,
          "curve": "linear"
        },
        {
          "time": 299.2,
          "value": -179,
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": -179,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": -90,
          "curve": "linear"
        }
      ],
      "character:3:pose": [
        {
          "time": 57.1,
          "value": {
            "torso": [
              0,
              0.9950371902099893,
              0.09950371902099893
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.11073202057883433,
              -0.9227668381569528,
              -0.36910673526278115
            ],
            "left-forearm": [
              0.07755667343294813,
              -0.9694584179118516,
              -0.23267002029884437
            ],
            "left-thigh": [
              0.05483626876013335,
              -0.9139378126688893,
              0.4021326375743113
            ],
            "left-shin": [
              0.019853622797734376,
              -0.9926811398867188,
              0.11912173678640625
            ],
            "right-upperArm": [
              -0.1388591297471342,
              -0.9257275316475615,
              0.3517764620260734
            ],
            "right-forearm": [
              -0.06941248035268513,
              -0.7932854897449728,
              0.6048801859305417
            ],
            "right-thigh": [
              -0.04653226875338139,
              -0.9306453750676277,
              -0.3629516962763748
            ],
            "right-shin": [
              -0.017956910222755067,
              -0.8978455111377533,
              -0.43994430045749916
            ]
          },
          "curve": "linear"
        },
        {
          "time": 72.1,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "linear"
        },
        {
          "time": 299.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "linear"
        },
        {
          "time": 468.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "hold"
        },
        {
          "time": 471.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "linear"
        }
      ],
      "character:4:position": [
        {
          "time": 72.1,
          "value": {
            "x": 1443,
            "y": 1532
          },
          "curve": "linear"
        },
        {
          "time": 299.2,
          "value": {
            "x": 654,
            "y": 689
          },
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": {
            "x": 654,
            "y": 689
          },
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": {
            "x": 2392,
            "y": 1996
          },
          "curve": "linear"
        }
      ],
      "character:4:direction": [
        {
          "time": 72.1,
          "value": 136,
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": 136,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": -180,
          "curve": "linear"
        }
      ],
      "character:4:pose": [
        {
          "time": 57.1,
          "value": {
            "torso": [
              0,
              0.9950371902099893,
              0.09950371902099893
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.11073202057883433,
              -0.9227668381569528,
              -0.36910673526278115
            ],
            "left-forearm": [
              0.07755667343294813,
              -0.9694584179118516,
              -0.23267002029884437
            ],
            "left-thigh": [
              0.05483626876013335,
              -0.9139378126688893,
              0.4021326375743113
            ],
            "left-shin": [
              0.019853622797734376,
              -0.9926811398867188,
              0.11912173678640625
            ],
            "right-upperArm": [
              -0.1388591297471342,
              -0.9257275316475615,
              0.3517764620260734
            ],
            "right-forearm": [
              -0.06941248035268513,
              -0.7932854897449728,
              0.6048801859305417
            ],
            "right-thigh": [
              -0.04653226875338139,
              -0.9306453750676277,
              -0.3629516962763748
            ],
            "right-shin": [
              -0.017956910222755067,
              -0.8978455111377533,
              -0.43994430045749916
            ]
          },
          "curve": "linear"
        },
        {
          "time": 72.1,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "linear"
        },
        {
          "time": 299.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "linear"
        },
        {
          "time": 468.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "hold"
        },
        {
          "time": 471.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "linear"
        }
      ],
      "character:1:direction": [
        {
          "time": 451.9,
          "value": -46,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "character:1:elevation": [
        {
          "time": 451.9,
          "value": 180,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "character:1:pose": [
        {
          "time": 451.9,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "linear"
        },
        {
          "time": 468.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "left-forearm": [
              -0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "left-thigh": [
              0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "left-shin": [
              0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ],
            "right-upperArm": [
              -0.09759000729485331,
              -0.9759000729485331,
              0.19518001458970663
            ],
            "right-forearm": [
              0.11830270160037808,
              -0.8675531450694393,
              0.48306936486821045
            ],
            "right-thigh": [
              -0.08865381729392147,
              -0.9850424143769052,
              0.1477563621565358
            ],
            "right-shin": [
              -0.029980518991926525,
              0.019987012661284352,
              -0.9993506330642176
            ]
          },
          "curve": "hold"
        },
        {
          "time": 471.2,
          "value": {
            "torso": [
              0,
              1,
              0
            ],
            "head": [
              0,
              1,
              0
            ],
            "left-upperArm": [
              0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "left-forearm": [
              0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "left-thigh": [
              0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "left-shin": [
              0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ],
            "right-upperArm": [
              -0.2240174139018968,
              -0.9739887560952034,
              -0.034089606463332124
            ],
            "right-forearm": [
              -0.10880428290861711,
              -0.9891298446237919,
              0.0989129844623792
            ],
            "right-thigh": [
              -0.10432150855991194,
              -0.9935381767610661,
              0.044709217954247975
            ],
            "right-shin": [
              -0.05486164878526202,
              -0.9974845233684003,
              -0.044886803551578015
            ]
          },
          "curve": "linear"
        }
      ],
      "character:2:elevation": [
        {
          "time": 451.9,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "character:3:elevation": [
        {
          "time": 451.9,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "character:4:elevation": [
        {
          "time": 451.9,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "light:4:level": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        }
      ],
      "light:9:level": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 21.5,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 24.5,
          "value": 100,
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": 100,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "light:7:level": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 451.9,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 48,
          "curve": "linear"
        },
        {
          "time": 487.9,
          "value": 48,
          "curve": "hold"
        },
        {
          "time": 490.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "light:7:color": [
        {
          "time": 0,
          "value": "#b3c9ff",
          "curve": "hold"
        },
        {
          "time": 468.2,
          "value": "#b3c9ff",
          "curve": "hold"
        },
        {
          "time": 471.2,
          "value": "#719cff",
          "curve": "linear"
        }
      ],
      "light:10:level": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 451.9,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 17.1,
          "curve": "linear"
        },
        {
          "time": 487.9,
          "value": 17.1,
          "curve": "hold"
        },
        {
          "time": 490.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "light:10:color": [
        {
          "time": 0,
          "value": "#b8cdff",
          "curve": "hold"
        },
        {
          "time": 468.2,
          "value": "#b8cdff",
          "curve": "hold"
        },
        {
          "time": 471.2,
          "value": "#719cff",
          "curve": "linear"
        }
      ],
      "light:8:level": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 21.5,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 24.5,
          "value": 100,
          "curve": "linear"
        },
        {
          "time": 451.9,
          "value": 100,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "light:5:level": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 451.9,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 454.9,
          "value": 100,
          "curve": "linear"
        },
        {
          "time": 468.2,
          "value": 100,
          "curve": "hold"
        },
        {
          "time": 471.2,
          "value": 0,
          "curve": "linear"
        }
      ],
      "light:11:level": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 468.2,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 471.2,
          "value": 100,
          "curve": "linear"
        },
        {
          "time": 487.9,
          "value": 100,
          "curve": "hold"
        },
        {
          "time": 490.9,
          "value": 0,
          "curve": "linear"
        }
      ],
      "light:12:level": [
        {
          "time": 0,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 487.9,
          "value": 0,
          "curve": "hold"
        },
        {
          "time": 490.9,
          "value": 65,
          "curve": "linear"
        }
      ],
      "light:13:level": [
        {
          "time": 0,
          "value": 65,
          "curve": "hold"
        },
        {
          "time": 21.5,
          "value": 65,
          "curve": "hold"
        },
        {
          "time": 24.5,
          "value": 0,
          "curve": "linear"
        }
      ]
    },
    "lightingCues": [
      {
        "time": 21.5,
        "label": "Blue and yellow PARs"
      },
      {
        "time": 451.9,
        "label": "Two spots + orange centre"
      },
      {
        "time": 468.2,
        "label": "Two spots + blue centre"
      },
      {
        "time": 487.9,
        "label": "West upstage Prelude - sails down"
      }
    ]
  },
  "views": []
};
