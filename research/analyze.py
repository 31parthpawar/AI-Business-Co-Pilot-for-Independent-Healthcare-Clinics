# Survey analysis: python3 research/analyze.py research/responses.csv
# Prints counts for all respondents and the 5+ years target segment, cross-tabs and open answers.
import sys, pandas as pd
pd.set_option('display.width', 250); pd.set_option('display.max_columns', 20)
df = pd.read_csv(sys.argv[1])
C = list(df.columns)
yrs = C[2]
tgt = df[df[yrs] != "Less than 5"]  # target segment: 5+ years
OPTS = {
 4: ['Vaccinations','Procedures','Diagnostic tests','Health packages or memberships','Pharmacy','None'],
 5: ['Paper register or diary','Excel','Clinic software or EMR','WhatsApp','My staff handles it'],
 11: ['Getting new patients','Patients not coming back','Competition from hospitals and chains','Rising rent and costs','Finding or keeping staff','Too much time on admin','Marketing the clinic'],
 12: ['Word of mouth','Google search or Maps','Practo or other apps','Referrals from doctors or hospitals','Social media','Clinic location or walk-ins'],
 13: ['Google Business profile or Maps','Practo or other listing apps','Instagram or Facebook','WhatsApp messages to patients','Clinic website','Pamphlets, hoardings or newspaper','Health camps or school and society tie-ups','Nothing, I rely on word of mouth'],
 17: ['Which patients have stopped coming','Monthly patient visit trends','Which services are used most','Where new patients come from','Which marketing is working','Busy and slow months','How I compare to similar clinics','Suggestions to grow the clinic'],
 18: ['Patient visit counts','Which services patients use','Appointment records','Earnings and billing','None of these'],
}
def multi(d, i):
    s = d[C[i]].fillna('')
    return {o: int(s.str.contains(o, regex=False).sum()) for o in OPTS[i]}
def single(d, i):
    return d[C[i]].fillna('(blank)').str.strip().value_counts().to_dict()
for name, d in [('ALL', df), ('TARGET 5+ yrs', tgt)]:
    n = len(d); print(f'\n######## {name} n={n}')
    for i in range(1, 20):
        r = multi(d, i) if i in OPTS else single(d, i)
        print(f'\n{C[i][:70]}')
        for k, v in sorted(r.items(), key=lambda x: -x[1]):
            print(f'  {v:3d} ({100*v/n:4.0f}%)  {k}')
print('\n######## PICK LIMITS (form did not enforce them)')
for i, lim in [(11, 2), (12, 2), (17, 3)]:
    k = sum(df[C[i]].fillna('').str.contains(o, regex=False).astype(int) for o in OPTS[i])
    ok = (k > 0) & (k <= lim)
    print(f'Q{i}: {int((k > lim).sum())} ticked more than {lim}. Within limit (n={int(ok.sum())}):')
    for o in OPTS[i]:
        v = int(df[C[i]][ok].str.contains(o, regex=False).sum())
        print(f'  {v:3d} ({100*v/ok.sum():4.0f}%)  {o}')
print('\n######## SEGMENTS (all): n, very useful, free only, would pay 500+')
s = lambda i: df[C[i]].fillna('').str.strip()
emr = s(5).str.contains('EMR', regex=False)
segs = {'10 to 20 yrs': s(2) == '10 to 20', 'More than 20 yrs': s(2) == 'More than 20',
        '2+ hrs business work': s(6) != 'Under 2', 'Under 2 hrs': s(6) == 'Under 2',
        'Uses EMR': emr, 'No EMR': ~emr, '20+ patients/day': s(3) != 'Under 20', 'Under 20/day': s(3) == 'Under 20'}
p500 = s(19).isin(['₹500 to ₹1,500', '₹1,500 to ₹3,000', 'More than ₹3,000'])
for name, g in segs.items():
    print(f'  {name:22s} n={int(g.sum()):2d}  very={int((g & (s(16) == "Very useful")).sum()):2d}  free={int((g & (s(19) == "Nothing, only if free")).sum()):2d}  pay500+={int((g & p500).sum()):2d}')
print('\n######## CROSS-TABS (all)')
for a, b in [(16, 19), (15, 16), (10, 16), (9, 7), (9, 14), (2, 16), (11, 10)]:
    if b == 10:
        g = s(11).str.contains('Getting new patients', regex=False)
        print(pd.crosstab(s(10), g.rename('Getting new patients a top challenge')), '\n')
        continue
    print(pd.crosstab(s(a), s(b)), '\n')
print('Q11 getting new patients & no promotion:', int((s(11).str.contains('Getting new patients') & s(13).str.contains('Nothing')).sum()))
gp = s(13).str.contains('Google'); gs = s(12).str.contains('Google')
print('Google profile users with Google patients:', int((gp & gs).sum()), 'of', int(gp.sum()), '| non-users:', int((~gp & gs).sum()), 'of', int((~gp).sum()))
print('\n######## CROSS-TABS (target)')
print(pd.crosstab(tgt[C[16]], tgt[C[19]]))
print(pd.crosstab(tgt[C[16]], tgt[C[14]]))
print(pd.crosstab(tgt[C[9]], tgt[C[7]]))
print(pd.crosstab(tgt[C[15]], tgt[C[16]]))
print(pd.crosstab(tgt[C[10]], tgt[C[16]]))
ped = df[C[1]].str.strip().str.lower().str.contains('pedi|paedi')
print('\nPediatric-related:', int(ped.sum()))
print('\n######## OPEN ANSWERS')
for v in df[C[20]].dropna():
    print('-', ' '.join(str(v).split()))
