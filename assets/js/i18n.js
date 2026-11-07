/* =========================================================
   Boda Boda Sacco — English / Kiswahili
   English is the source language. Every English line on the
   site is listed below with its Swahili version; if a line is
   missing it simply stays in English.
   ========================================================= */
window.I18N = (function () {
  'use strict';

  const SW = {
    /* Navigation and shell */
    'Home': 'Mwanzo',
    'Savings': 'Akiba',
    'Loans': 'Mikopo',
    'Advantages': 'Faida',
    'Join': 'Jiunge',
    'My account': 'Akaunti yangu',
    'Log in': 'Ingia',
    'Log out': 'Toka',
    'Become a member': 'Kuwa mwanachama',
    'Reset demo data': 'Anzisha data ya majaribio upya',
    'Reset demo data?': 'Anzisha data ya majaribio upya?',
    'Skip to content': 'Ruka hadi maudhui',
    'Close': 'Funga',
    'Cancel': 'Ghairi',
    'Menu': 'Menyu',
    'Language': 'Lugha',
    'Main': 'Kuu',
    'Footer': 'Chini',

    /* Home */
    'Built for riders': 'Kwa wapanda boda boda',
    'Your ride. Your savings. Your future.': 'Pikipiki yako. Akiba yako. Kesho yako.',
    'Save from just KSh 50 a day, borrow when the road gets tough, and grow together with riders like you.': 'Weka akiba kuanzia KSh 50 tu kwa siku, kopa barabara inapokuwa ngumu, na kua pamoja na wapanda boda wenzako.',
    'Go to my account': 'Nenda kwenye akaunti yangu',
    'Try the loan calculator →': 'Jaribu kikokotoo cha mkopo →',
    'Start saving daily': 'Anza kuweka akiba kila siku',
    'Loan processing': 'Uchakataji wa mkopo',
    'Dividends': 'Gawio',
    'Member owned': 'Inamilikiwa na wanachama',
    'Savings growing': 'Akiba inakua',
    'Every day counts': 'Kila siku ni muhimu',
    'Save the way you ride': 'Weka akiba kama unavyoendesha',
    "Simple savings built around a rider's day.": 'Akiba rahisi iliyojengwa kulingana na siku ya mpanda boda.',
    'Daily boda savings': 'Akiba ya kila siku ya boda',
    'Turn on autosave from as little as KSh 50 a day. Small amounts, every day, add up.': 'Washa akiba ya kiotomatiki kuanzia KSh 50 tu kwa siku. Kiasi kidogo, kila siku, huongezeka.',
    'From KSh 50 a day': 'Kuanzia KSh 50 kwa siku',
    'Locked savings': 'Akiba iliyofungwa',
    'Non-withdrawable savings that earn you annual dividends at the end of the year.': 'Akiba isiyotolewa inayokupatia gawio la kila mwaka mwishoni mwa mwaka.',
    'Annual dividends': 'Gawio la kila mwaka',
    'Bike replacement fund': 'Mfuko wa kubadilisha pikipiki',
    'Saving for a new motorbike or an engine overhaul? Set it aside here, bit by bit.': 'Unaweka akiba kwa ajili ya pikipiki mpya au kukarabati injini? Iweke kando hapa, kidogo kidogo.',
    'Your next bike': 'Pikipiki yako ijayo',
    'M-Pesa in, savings out': 'M-Pesa ndani, akiba nje',
    'Save in seconds from the phone in your pocket.': 'Weka akiba kwa sekunde chache kutoka simu iliyo mfukoni mwako.',
    'Built around your day': 'Imeundwa kulingana na siku yako',
    'You earn fare by fare. So we let you save fare by fare — not in big lumps at the end of the month.': 'Unapata kipato kidogo kidogo. Kwa hivyo tunakuwezesha kuweka akiba kidogo kidogo — sio kiasi kikubwa mwisho wa mwezi.',
    'Autosave from KSh 50 a day, straight from M-Pesa.': 'Akiba ya kiotomatiki kuanzia KSh 50 kwa siku, moja kwa moja kutoka M-Pesa.',
    'Works on any phone — USSD when you have no data.': 'Inafanya kazi kwenye simu yoyote — USSD ukiwa huna data.',
    'Your locked savings earn a share of the Sacco profit every year.': 'Akiba yako iliyofungwa inakupa sehemu ya faida ya Sacco kila mwaka.',
    'Withdraw from daily savings any time, no penalties.': 'Toa kutoka akiba ya kila siku wakati wowote, bila adhabu.',
    'Explore savings': 'Chunguza akiba',
    'Loans made for riders': 'Mikopo iliyoundwa kwa wapanda boda',
    'Real help for the real things that come up on the road.': 'Msaada wa kweli kwa mambo halisi yanayotokea barabarani.',
    'Spare parts and repairs': 'Vipuri na matengenezo',
    'Fix it and get back on the road.': 'Itengeneze na urudi barabarani.',
    'Most requested': 'Inayoombwa zaidi',
    'Motorbike asset loan': 'Mkopo wa kununua pikipiki',
    'Finance a bike of your own.': 'Pata mkopo wa pikipiki yako mwenyewe.',
    'Asset finance': 'Mkopo wa mali',
    'Emergency loan': 'Mkopo wa dharura',
    'Fast help for urgent needs.': 'Msaada wa haraka kwa mahitaji ya dharura.',
    'Same day': 'Siku hiyo hiyo',
    'Gear and license': 'Vifaa vya usalama na leseni',
    'Helmets, reflectors and your licence.': 'Kofia ngumu, viakisi na leseni yako.',
    'Safety first': 'Usalama kwanza',
    'School fees loan': 'Mkopo wa ada ya shule',
    'Keep your children in school.': 'Wafanye watoto wako waendelee shuleni.',
    'Term one to three': 'Muhula wa kwanza hadi wa tatu',
    'Business booster': 'Kichocheo cha biashara',
    'Grow a side business beyond the bike.': 'Kuza biashara ndogo zaidi ya pikipiki.',
    'Grow income': 'Kuza kipato',
    'From {rate}% per month': 'Kuanzia {rate}% kwa mwezi',
    'See all loans': 'Tazama mikopo yote',
    'How it works': 'Inavyofanya kazi',
    'Three steps from the stage to your savings.': 'Hatua tatu kutoka stendi hadi akiba yako.',
    'Join with your phone': 'Jiunge kwa simu yako',
    'Name, phone number, ID and a 4-digit PIN. It takes under a minute.': 'Jina, namba ya simu, kitambulisho na PIN ya tarakimu nne. Inachukua chini ya dakika moja.',
    'Save a little daily': 'Weka akiba kidogo kila siku',
    'Pick KSh 50, 100, 200 or more. Autosave runs on M-Pesa every day.': 'Chagua KSh 50, 100, 200 au zaidi. Akiba ya kiotomatiki hufanyika kwa M-Pesa kila siku.',
    'Borrow when you need': 'Kopa unapohitaji',
    'Borrow up to 3× your savings for a bike, repairs, fees or an emergency.': 'Kopa hadi mara 3 ya akiba yako kwa pikipiki, matengenezo, ada au dharura.',
    'A Sacco that belongs to riders': 'Sacco inayomilikiwa na wapanda boda',
    'Every member owns a share. Profits come back to the people who saved — not to outsiders.': 'Kila mwanachama anamiliki sehemu. Faida hurudi kwa wale walioweka akiba — sio kwa wageni.',
    'Savings to borrow': 'Akiba kwa mkopo',
    'Sample dividend rate': 'Kiwango cha gawio la mfano',
    'Hidden charges': 'Gharama zilizofichwa',
    'Ready to start?': 'Uko tayari kuanza?',
    'Join in under a minute. Start with KSh 50.': 'Jiunge chini ya dakika moja. Anza na KSh 50.',
    'I already have an account': 'Nina akaunti tayari',

    /* Savings page */
    'Three simple ways to put money aside, all built for riders.': 'Njia tatu rahisi za kuweka pesa kando, zote zimeundwa kwa wapanda boda.',
    'Your savings': 'Akiba yako',
    'Total saved': 'Jumla iliyowekwa',
    '{n} buckets': 'Mifuko {n}',
    'Withdraw any time': 'Toa wakati wowote',
    'Earns dividends': 'Inapata gawio',
    'Bike fund': 'Mfuko wa pikipiki',
    'Save now': 'Weka akiba sasa',
    'Start saving': 'Anza kuweka akiba',
    'Autosave': 'Akiba ya kiotomatiki',
    'Bike goals': 'Malengo ya pikipiki',
    'Small money adds up': 'Pesa ndogo huongezeka',
    'A year of saving, at three everyday amounts.': 'Akiba ya mwaka mmoja, kwa viwango vitatu vya kila siku.',
    'after one year': 'baada ya mwaka mmoja',
    'Illustration only. Savings are held in your own account and are not affected by other members.': 'Mfano tu. Akiba huhifadhiwa kwenye akaunti yako na haiathiriwi na wanachama wengine.',
    'Locked savings earn dividends': 'Akiba iliyofungwa inapata gawio',
    'Locked savings and share capital cannot be withdrawn, but they earn a share of the Sacco profit each year.': 'Akiba iliyofungwa na hisa hazitolewi, lakini hupata sehemu ya faida ya Sacco kila mwaka.',
    'Sample: KSh 10,000 locked': 'Mfano: KSh 10,000 zilizofungwa',
    'At a 12% dividend rate that is about KSh 1,200 at the end of the year.': 'Kwa kiwango cha gawio la 12%, hiyo ni karibu KSh 1,200 mwishoni mwa mwaka.',
    'Final dividend rates are proposed by the board and approved by members at the AGM.': 'Viwango vya mwisho vya gawio hupendekezwa na bodi na kuidhinishwa na wanachama kwenye mkutano mkuu.',
    'Profits come back to riders.': 'Faida hurudi kwa wapanda boda.',
    'Start with KSh 50': 'Anza na KSh 50',
    'Open your savings account in under a minute.': 'Fungua akaunti yako ya akiba chini ya dakika moja.',
    'See loans': 'Tazama mikopo',

    /* Loans page */
    'You can borrow up to {amount}': 'Unaweza kukopa hadi {amount}',
    'Based on {saved} in savings. You may borrow up to 3× your savings, capped at KSh 200,000.': 'Kulingana na {saved} za akiba. Unaweza kukopa hadi mara 3 ya akiba yako, kikomo KSh 200,000.',
    'Active loans: {n} of 2.': 'Mikopo inayoendelea: {n} kati ya 2.',
    'Available to borrow': 'Inapatikana kukopa',
    'Apply for a loan': 'Omba mkopo',
    'Save KSh 500 to unlock borrowing': 'Weka KSh 500 ili ufungue mikopo',
    'Your loan limit grows with your savings: 3× whatever you have saved, up to KSh 200,000.': 'Kikomo chako cha mkopo huongezeka na akiba yako: mara 3 ya uliyoweka, hadi KSh 200,000.',
    'Saved so far': 'Iliyowekwa hadi sasa',
    'Join to see your loan limit': 'Jiunge uone kikomo chako cha mkopo',
    'Members can borrow up to 3× their savings, up to KSh 200,000. Save KSh 500 to get started.': 'Wanachama wanaweza kukopa hadi mara 3 ya akiba yao, hadi KSh 200,000. Weka KSh 500 kuanza.',
    'Your savings': 'Akiba yako',
    'Loan calculator': 'Kikokotoo cha mkopo',
    'Slide to see your estimated monthly repayment.': 'Telezesha uone makadirio ya malipo yako ya kila mwezi.',
    'Loan amount': 'Kiasi cha mkopo',
    'Repayment period': 'Muda wa kulipa',
    'Loan type': 'Aina ya mkopo',
    '1 month': 'Mwezi 1',
    '{n} months': 'Miezi {n}',
    'Estimated monthly repayment': 'Makadirio ya malipo ya kila mwezi',
    'per month': 'kwa mwezi',
    '{rate}% per month': '{rate}% kwa mwezi',
    'Interest rate': 'Kiwango cha riba',
    'Total interest': 'Jumla ya riba',
    'Total to repay': 'Jumla ya kulipa',
    'Apply for this amount': 'Omba kiasi hiki',
    'Sample rates for the prototype only. Final rates will be set by the Sacco.': 'Viwango vya mfano kwa ajili ya mfano wa awali tu. Viwango vya mwisho vitapangwa na Sacco.',
    'Getting a loan': 'Kupata mkopo',
    'Straightforward, and no paperwork queues.': 'Ni rahisi, hakuna foleni za karatasi.',
    'Check your limit': 'Angalia kikomo chako',
    'Your limit is 3× your savings, up to KSh 200,000. You need at least KSh 500 saved.': 'Kikomo chako ni mara 3 ya akiba yako, hadi KSh 200,000. Unahitaji angalau KSh 500 zilizowekwa.',
    'Apply in the app': 'Omba kupitia app',
    'Choose the loan, amount and repayment period. Most requests are reviewed within 24 hours.': 'Chagua mkopo, kiasi na muda wa kulipa. Maombi mengi hupitiwa ndani ya saa 24.',
    'Get paid by M-Pesa': 'Lipwa kwa M-Pesa',
    'Approved loans go straight to your phone. Repay a little each month, also on M-Pesa.': 'Mikopo iliyoidhinishwa huenda moja kwa moja kwenye simu yako. Lipa kidogo kila mwezi, pia kwa M-Pesa.',
    'Keep the bike earning': 'Endeleza pikipiki kupata kipato',
    'Repairs should not cost you a week of fares.': 'Matengenezo hayapaswi kukugharimu kipato cha wiki.',
    'Borrow for the things that keep you moving': 'Kopa kwa mambo yanayokuweka barabarani',
    'An engine that needs work, a licence that needs renewing, a child who needs fees. Short, clear loans with a repayment plan you can see.': 'Injini inayohitaji kazi, leseni inayohitaji kuhuishwa, mtoto anayehitaji ada. Mikopo mifupi na wazi yenye mpango wa malipo unaouona.',
    'Flat, transparent interest — see the total before you apply.': 'Riba ya wazi — ona jumla kabla ya kuomba.',
    'Repay early with no penalty.': 'Lipa mapema bila adhabu.',
    'Two active loans at a time, so repayment stays manageable.': 'Mikopo miwili inayoendelea kwa wakati mmoja, ili malipo yawe rahisi.',
    'Prototype: applications are approved instantly and are simulated.': 'Mfano: maombi hukubaliwa papo hapo na ni ya majaribio.',
    'Need a loan?': 'Unahitaji mkopo?',
    'Join the Sacco, save a little, and your limit starts growing today.': 'Jiunge na Sacco, weka akiba kidogo, na kikomo chako kianze kukua leo.',

    /* Advantages */
    'Advantages of membership': 'Faida za uanachama',
    'Membership is more than savings and loans.': 'Uanachama ni zaidi ya akiba na mikopo.',
    'M-Pesa and USSD': 'M-Pesa na USSD',
    'Save and repay with M-Pesa. USSD support means it works on any phone, no data needed.': 'Weka akiba na lipa kwa M-Pesa. Huduma ya USSD inamaanisha inafanya kazi kwenye simu yoyote, bila data.',
    'Rider training': 'Mafunzo ya wapanda boda',
    'Road safety, first aid, customer service and more, taught to members.': 'Usalama barabarani, huduma ya kwanza, huduma kwa wateja na mengineyo, hufundishwa kwa wanachama.',
    'License and compliance help': 'Msaada wa leseni na kufuata sheria',
    'Get help with your license and the paperwork that keeps you legal on the road.': 'Pata msaada wa leseni yako na nyaraka zinazokuweka halali barabarani.',
    'When the Sacco does well, members share in the profit every year.': 'Sacco inapofanya vizuri, wanachama hugawana faida kila mwaka.',
    'Insurance cover': 'Bima',
    'Protection for you and your bike through trusted insurance partners.': 'Ulinzi kwako na pikipiki yako kupitia washirika wa bima wanaoaminika.',
    'A community of riders': 'Jamii ya wapanda boda',
    'Belong to a group that backs each other up, on and off the road.': 'Kuwa sehemu ya kundi linalosaidiana, barabarani na nje ya barabara.',
    'You are not riding alone': 'Huendeshi peke yako',
    'A Sacco is only as strong as its members. Ride with people who understand the road, the fares and the bad days.': 'Sacco ni imara kadiri wanachama wake walivyo. Endesha pamoja na watu wanaoelewa barabara, nauli na siku ngumu.',
    'Join the Sacco': 'Jiunge na Sacco',
    'Ride with us': 'Endesha nasi',
    'How savings work': 'Jinsi akiba inavyofanya kazi',

    /* Join / login */
    'It takes less than a minute.': 'Inachukua chini ya dakika moja.',
    'Full name': 'Jina kamili',
    'Phone number': 'Namba ya simu',
    'ID number': 'Namba ya kitambulisho',
    'Stage or area': 'Stendi au eneo',
    'Daily saving': 'Akiba ya kila siku',
    'PIN': 'PIN',
    'Confirm PIN': 'Thibitisha PIN',
    'I agree to the Sacco rules and I understand this is a working prototype, not a real financial account.': 'Nakubali kanuni za Sacco na ninaelewa huu ni mfano unaofanya kazi, sio akaunti halisi ya kifedha.',
    'Join now': 'Jiunge sasa',
    'Close menu': 'Funga menyu',
    'Open menu': 'Fungua menyu',
    'Prototype only. No real account is created.': 'Mfano tu. Hakuna akaunti halisi inayofunguliwa.',
    'Already a member?': 'Tayari ni mwanachama?',
    'Autosave from your M-Pesa, every day.': 'Akiba ya kiotomatiki kutoka M-Pesa yako, kila siku.',
    'What you get': 'Unachopata',
    'A member number and your own savings account.': 'Namba ya mwanachama na akaunti yako ya akiba.',
    'Three savings buckets: daily, locked and bike fund.': 'Mifuko mitatu ya akiba: ya kila siku, iliyofungwa na ya pikipiki.',
    'A loan limit that grows with your savings.': 'Kikomo cha mkopo kinachokua na akiba yako.',
    'Training, insurance and dividend benefits.': 'Mafunzo, bima na manufaa ya gawio.',
    'Your details stay in this browser. Nothing is sent to a server.': 'Taarifa zako zinabaki kwenye kivinjari hiki. Hakuna kinachotumwa kwa seva.',
    'Welcome back': 'Karibu tena',
    'Log in with the phone number you joined with.': 'Ingia kwa namba ya simu uliyojiunga nayo.',
    'Open the demo account': 'Fungua akaunti ya majaribio',
    'A ready-made member with savings history and an active loan.': 'Mwanachama tayari mwenye historia ya akiba na mkopo unaoendelea.',
    'New here?': 'Ni mgeni hapa?',
    'National ID': 'Kitambulisho cha taifa',
    '4 digits': 'Tarakimu 4',
    'e.g. Engine overhaul': 'mf. Kurekebisha injini',

    /* Dashboard */
    'Member dashboard': 'Dashibodi ya mwanachama',
    'Hello, {name}': 'Karibu, {name}',
    'Member since {date}': 'Mwanachama tangu {date}',
    'Total savings': 'Jumla ya akiba',
    '+{amount} this month': '+{amount} mwezi huu',
    'Loan balance': 'Salio la mkopo',
    '{n} active': '{n} inayoendelea',
    'No active loans': 'Hakuna mkopo unaoendelea',
    'Dividends earned': 'Gawio lililopatikana',
    '{rate}% on locked savings': '{rate}% kwa akiba iliyofungwa',
    'day': 'siku',
    'Due today': 'Inatakiwa leo',
    'Done for today': 'Imekamilika leo',
    'Off': 'Imezimwa',
    'Goal {goal}': 'Lengo {goal}',
    'No lock-in': 'Hakuna kufungwa',
    'Save': 'Weka akiba',
    'Withdraw': 'Toa',
    'Edit goal': 'Badilisha lengo',
    'Your loans': 'Mikopo yako',
    'New loan': 'Mkopo mpya',
    'No loans yet. Your limit grows with every shilling you save.': 'Hakuna mikopo bado. Kikomo chako hukua kwa kila shilingi unayoweka.',
    'Recent activity': 'Shughuli za hivi karibuni',
    'No activity yet. Make your first deposit to get started.': 'Hakuna shughuli bado. Weka akiba yako ya kwanza kuanza.',
    'Daily autosave': 'Akiba ya kiotomatiki ya kila siku',
    'Autosave on M-Pesa': 'Akiba ya kiotomatiki kwa M-Pesa',
    '{amount} every day': '{amount} kila siku',
    'Paused': 'Imesimamishwa',
    'Daily amount': 'Kiasi cha kila siku',
    'Change any time': 'Badilisha wakati wowote',
    'Today': 'Leo',
    'Autosave not run yet': 'Akiba ya kiotomatiki haijafanyika bado',
    'Autosave complete': 'Akiba ya kiotomatiki imekamilika',
    'Done': 'Imekamilika',
    'In the real product autosave is charged from M-Pesa each morning. Here it is simulated.': 'Katika bidhaa halisi akiba ya kiotomatiki hukatwa kutoka M-Pesa kila asubuhi. Hapa ni majaribio.',
    'Quick actions': 'Vitendo vya haraka',
    'Save daily': 'Weka akiba ya siku',
    'Lock savings': 'Funga akiba',
    'Your locked savings of {amount} are projected to earn about {dividend} this year at a 12% rate.': 'Akiba yako iliyofungwa ya {amount} inakadiriwa kupata karibu {dividend} mwaka huu kwa kiwango cha 12%.',
    'Paid once a year': 'Hulipwa mara moja kwa mwaka',
    'Dividends are approved at the AGM and paid to your savings account.': 'Gawio huidhinishwa kwenye mkutano mkuu na hulipwa kwenye akaunti yako ya akiba.',
    'Prototype only. Balances are simulated and stored in this browser.': 'Mfano tu. Salio ni za majaribio na huhifadhiwa kwenye kivinjari hiki.',
    'Cleared': 'Imekamilika',
    'Active': 'Inaendelea',
    'remaining': 'imesalia',
    'Paid {paid} of {total}': 'Imelipwa {paid} kati ya {total}',
    'Loan cleared': 'Mkopo umekamilika',
    'Next payment {amount}': 'Malipo yajayo {amount}',
    'Repay': 'Lipa',
    'Due {date}': 'Inatakiwa {date}',

    /* Modals, payments and messages */
    'M-Pesa payment': 'Malipo ya M-Pesa',
    'Demo checkout — no money moves.': 'Malipo ya majaribio — hakuna pesa inayohamishwa.',
    'In a real Sacco an M-Pesa request would pop up on this phone. Here you can just confirm to continue.': 'Katika Sacco halisi ombi la M-Pesa lingetokea kwenye simu hii. Hapa unaweza kuthibitisha tu kuendelea.',
    'Confirm payment': 'Thibitisha malipo',
    'Processing…': 'Inachakata…',
    'Amount': 'Kiasi',
    'Bucket': 'Mfuko',
    'Current balance': 'Salio la sasa',
    'M-Pesa number': 'Namba ya M-Pesa',
    'Simulated M-Pesa deposit': 'Amana ya M-Pesa ya majaribio',
    'Save to': 'Weka akiba kwenye',
    'Enter an amount of at least KSh 1.': 'Weka kiasi cha angalau KSh 1.',
    'The most you can save at once is KSh 200,000.': 'Kiwango cha juu cha kuweka kwa mara moja ni KSh 200,000.',
    '{amount} added to {bucket}.': '{amount} imeongezwa kwenye {bucket}.',
    'That did not work. Please try again.': 'Hilo halikufanikiwa. Tafadhali jaribu tena.',
    'Nothing to withdraw yet': 'Hakuna cha kutoa bado',
    'Only daily savings can be withdrawn.': 'Ni akiba ya kila siku tu inayoweza kutolewa.',
    'Save something in daily savings first, then you can withdraw it to M-Pesa any time.': 'Weka akiba kwenye akiba ya kila siku kwanza, kisha unaweza kuitoa kwa M-Pesa wakati wowote.',
    'Withdraw to M-Pesa': 'Toa kwa M-Pesa',
    'Available in daily savings': 'Inapatikana kwenye akiba ya kila siku',
    'not withdrawable': 'haiwezi kutolewa',
    '{amount} sent to M-Pesa.': '{amount} imetumwa kwa M-Pesa.',
    'You can withdraw up to {amount}.': 'Unaweza kutoa hadi {amount}.',
    'Savings goal': 'Lengo la akiba',
    'Set a target and watch the bar fill up.': 'Weka lengo na uone kipimo kikijaa.',
    'Target amount': 'Kiasi cha lengo',
    'Still to go': 'Kilichobaki',
    'Save goal': 'Hifadhi lengo',
    'Goal updated.': 'Lengo limebadilishwa.',
    'Choose a target of at least KSh 1,000.': 'Chagua lengo la angalau KSh 1,000.',
    'You already have two active loans': 'Tayari una mikopo miwili inayoendelea',
    'Repay one to apply again.': 'Lipa mmoja ili uombe tena.',
    'Members can hold two active loans at a time. Clear one and you can borrow again straight away.': 'Wanachama wanaweza kuwa na mikopo miwili inayoendelea kwa wakati mmoja. Kamilisha mmoja na unaweza kukopa tena mara moja.',
    'What is it for?': 'Ni ya nini?',
    'Monthly repayment': 'Malipo ya kila mwezi',
    'Interest': 'Riba',
    'Interest ({detail})': 'Riba ({detail})',
    'Submit application': 'Tuma maombi',
    'The smallest loan is KSh 1,000.': 'Mkopo mdogo zaidi ni KSh 1,000.',
    'Your current limit is {amount}.': 'Kikomo chako cha sasa ni {amount}.',
    'Please check the amount and try again.': 'Tafadhali angalia kiasi na ujaribu tena.',
    'Loan approved: {amount} sent to M-Pesa. Repay {monthly} a month.': 'Mkopo umeidhinishwa: {amount} imetumwa kwa M-Pesa. Lipa {monthly} kwa mwezi.',
    'Repay loan': 'Lipa mkopo',
    '{amount} remaining': '{amount} imesalia',
    'Amount to repay': 'Kiasi cha kulipa',
    'This month {amount}': 'Mwezi huu {amount}',
    'Clear the loan': 'Kamilisha mkopo',
    'Outstanding': 'Kinachodaiwa',
    'Monthly payment': 'Malipo ya mwezi',
    'Next due': 'Malipo yajayo',
    'Pay with M-Pesa': 'Lipa kwa M-Pesa',
    'Loan repayment': 'Malipo ya mkopo',
    '{amount} paid. Thank you.': '{amount} imelipwa. Asante.',
    'Loan cleared. Hongera!': 'Mkopo umekamilika. Hongera!',
    'This clears your account and savings in this browser.': 'Hii itafuta akaunti na akiba yako kwenye kivinjari hiki.',
    'Everything you created in this prototype will be deleted. You can join again or use the demo account.': 'Kila kitu ulichounda kwenye mfano huu kitafutwa. Unaweza kujiunga tena au kutumia akaunti ya majaribio.',
    'Keep my data': 'Hifadhi data yangu',
    'Reset everything': 'Anzisha kila kitu upya',
    'Demo data cleared.': 'Data ya majaribio imefutwa.',
    'You are logged out.': 'Umetoka.',
    'Demo account loaded. Phone 0712 345 678, PIN 1234.': 'Akaunti ya majaribio imefunguliwa. Simu 0712 345 678, PIN 1234.',
    'Join first — it takes less than a minute.': 'Jiunge kwanza — inachukua chini ya dakika moja.',
    'Join first — then you can apply in one tap.': 'Jiunge kwanza — kisha unaweza kuomba kwa mbofyo mmoja.',
    'Autosave turned on.': 'Akiba ya kiotomatiki imewashwa.',
    'Autosave paused.': 'Akiba ya kiotomatiki imesimamishwa.',
    'Daily autosave set to {amount}.': 'Akiba ya kila siku imewekwa {amount}.',
    '{amount} autosaved today.': '{amount} imewekwa kiotomatiki leo.',
    'Welcome to the Sacco! Your member number is {no}.': 'Karibu kwenye Sacco! Namba yako ya mwanachama ni {no}.',
    'Welcome back, {name}.': 'Karibu tena, {name}.',
    'Enter your full name.': 'Weka jina lako kamili.',
    'Use a Kenyan mobile number, e.g. 0712 345 678.': 'Tumia namba ya simu ya Kenya, mf. 0712 345 678.',
    'Enter a valid ID number.': 'Weka namba sahihi ya kitambulisho.',
    'Your PIN must be 4 digits.': 'PIN yako lazima iwe tarakimu 4.',
    'The two PINs do not match.': 'PIN mbili hazifanani.',
    'Please accept the Sacco rules to continue.': 'Tafadhali kubali kanuni za Sacco kuendelea.',
    'This number is already registered. Try logging in.': 'Namba hii imesajiliwa tayari. Jaribu kuingia.',
    'Something went wrong. Please try again.': 'Kuna hitilafu. Tafadhali jaribu tena.',
    'No member found with that number.': 'Hakuna mwanachama mwenye namba hiyo.',
    'Incorrect PIN. Try again.': 'PIN si sahihi. Jaribu tena.',
    'Withdrawal to M-Pesa': 'Utoaji kwa M-Pesa',
    'Loan disbursed': 'Mkopo umetolewa',
    'Yearly': 'Kila mwaka',
    'Daily savings': 'Akiba ya kila siku',
    'Autosave from KSh 50 a day straight from your M-Pesa. Choose an amount that fits your day.': 'Akiba ya kiotomatiki kuanzia KSh 50 kwa siku moja kwa moja kutoka M-Pesa yako. Chagua kiasi kinachofaa siku yako.',
    'Non-withdrawable savings that grow untouched and earn annual dividends.': 'Akiba isiyotolewa inayokua bila kuguswa na kukupatia gawio la kila mwaka.',
    'For a new motorbike or a big engine overhaul. Build it up a little every day.': 'Kwa pikipiki mpya au ukarabati mkubwa wa injini. Ijenge kidogo kila siku.',
    'Loans for riders': 'Mikopo kwa wapanda boda',
    'Pick the loan that fits what you need, then see what it costs.': 'Chagua mkopo unaofaa mahitaji yako, kisha uone gharama yake.',
    'Join the Sacco and start with KSh 50.': 'Jiunge na Sacco na uanze na KSh 50.',
    'Save the way you ride. Borrow when the road gets tough.': 'Weka akiba kama unavyoendesha. Kopa barabara inapokuwa ngumu.',
    'Projected dividends': 'Gawio linalotarajiwa',

  };

  let currentLang = 'en';
  const originals = new WeakMap();
  const placeholders = new WeakMap();

  function t(text) {
    if (currentLang !== 'sw' || text == null) return text;
    return SW[text] || text;
  }

  function tf(text, vars) {
    let out = t(text);
    Object.keys(vars || {}).forEach(function (key) {
      out = out.split('{' + key + '}').join(String(vars[key]));
    });
    return out;
  }

  function skipNode(node) {
    const parent = node.parentNode;
    if (!parent || !parent.nodeName) return true;
    if (parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE' || parent.nodeName === 'NOSCRIPT') return true;
    if (parent.closest && parent.closest('[data-no-i18n], .toast, #lang-en, #lang-sw')) return true;
    return false;
  }

  function translateStatic(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      if (skipNode(node)) return;
      if (!originals.has(node)) originals.set(node, node.nodeValue);
      const original = originals.get(node);
      const key = original.replace(/\s+/g, ' ').trim();
      if (!key) return;
      if (currentLang === 'en') {
        if (node.nodeValue !== original) node.nodeValue = original;
        return;
      }
      if (SW[key]) {
        const lead = original.match(/^\s*/)[0];
        const trail = original.match(/\s*$/)[0];
        node.nodeValue = lead + SW[key] + trail;
      }
    });

    const fields = root.querySelectorAll ? root.querySelectorAll('[placeholder]') : [];
    Array.prototype.forEach.call(fields, function (field) {
      if (!placeholders.has(field)) placeholders.set(field, field.getAttribute('placeholder'));
      const original = placeholders.get(field);
      field.setAttribute('placeholder', currentLang === 'sw' ? (SW[original] || original) : original);
    });
  }

  function setLang(code) {
    currentLang = code === 'sw' ? 'sw' : 'en';
    try { window.localStorage.setItem('bbs.lang', currentLang); } catch (e) {}
    document.documentElement.setAttribute('lang', currentLang);
  }

  function init() {
    try {
      const saved = window.localStorage.getItem('bbs.lang');
      if (saved === 'sw') currentLang = 'sw';
    } catch (e) {}
    document.documentElement.setAttribute('lang', currentLang);
  }

  return {
    t: t,
    tf: tf,
    lang: function () { return currentLang; },
    setLang: setLang,
    init: init,
    translateStatic: translateStatic,
    dictionary: SW
  };
})();
