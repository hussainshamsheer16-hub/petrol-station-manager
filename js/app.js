const $ = s => document.querySelector(s),
  uid = () => Math.random().toString(36).slice(2, 9),
  td = new Date().toISOString().slice(0, 10);
const fmt = n => Math.round(n * 10 / 10).toLocaleString('en-PK'),
  Rs = n => 'Rs. ' + fmt(n);
const dd = n => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10)
};

function seed() {
  const p = uid(),
    q = uid(),
    s = uid();
  return {
    fuels: [{
      id: 'f1',
      name: 'Petrol',
      rate: 280,
      cost: 250,
      min: 2000,
      open: 10000
    }, {
      id: 'f2',
      name: 'Diesel',
      rate: 275,
      cost: 255,
      min: 2000,
      open: 6000
    }],
    suppliers: [{
      id: s,
      name: 'ABC Petroleum',
      phone: '0300-1112223'
    }],
    customers: [{
      id: p,
      name: 'Ali Transport',
      phone: '0300-1234567',
      address: 'Lahore',
      open: 50000
    }, {
      id: q,
      name: 'ABC Traders',
      phone: '0312-7654321',
      address: 'Lahore',
      open: 30000
    }],
    purchases: [{
      id: uid(),
      date: dd(3),
      fuel: 'f1',
      qty: 5000,
      rate: 250,
      supplier: s,
      inv: 'INV-001'
    }, {
      id: uid(),
      date: dd(1),
      fuel: 'f2',
      qty: 4000,
      rate: 255,
      supplier: s,
      inv: 'INV-002'
    }],
    sales: [...[6,
      5,
      4,
      3,
      2,
      1,
      0
    ].map((n, i) => ({
      id: uid(),
      date: dd(n),
      fuel: 'f1',
      qty: 900 + i * 80,
      rate: 280,
      cust: '',
      pay: 'Cash',
      om: 0,
      cm: 0
    })), {
      id: uid(),
      date: dd(1),
      fuel: 'f2',
      qty: 600,
      rate: 275,
      cust: p,
      pay: 'Credit',
      om: 0,
      cm: 0
    }, {
      id: uid(),
      date: dd(0),
      fuel: 'f2',
      qty: 400,
      rate: 275,
      cust: '',
      pay: 'Cash',
      om: 0,
      cm: 0
    }],
    cpay: [{
      id: uid(),
      cust: p,
      amount: 20000,
      method: 'Cash',
      date: dd(1),
      notes: 'Partial payment'
    }],
    spay: [{
      id: uid(),
      supplier: s,
      amount: 1000000,
      method: 'Bank',
      date: dd(2),
      notes: ''
    }],
    expenses: [{
      id: uid(),
      cat: 'Electricity',
      amount: 35000,
      date: dd(2),
      desc: 'Monthly electricity bill'
    }, {
      id: uid(),
      cat: 'Staff Salary',
      amount: 15000,
      date: dd(0),
      desc: 'Advance'
    }]
  }
}
let S;
try {
  S = JSON.parse(localStorage.getItem('ps') || 'null')
} catch (e) {}
S = S || seed();
const save = () => {
  try {
    localStorage.setItem('ps', JSON.stringify(S))
  } catch (e) {}
};
const sum = (a, k) => a.reduce((t, x) => t + (typeof k == 'function' ? k(x) : x[k]), 0);
const F = id => S.fuels.find(f => f.id == id) || {
    name: '?',
    rate: 0,
    cost: 0
  },
  C = id => S.customers.find(c => c.id == id),
  Su = id => S.suppliers.find(c => c.id == id);
const opening = (f, d) => f.open + sum(S.purchases.filter(x => x.fuel == f.id && x.date < d), 'qty') - sum(S.sales.filter(x => x.fuel == f.id && x.date < d), 'qty');
const stock = f => opening(f, '9999');
const cbal = c => c.open + sum(S.sales.filter(x => x.cust == c.id && x.pay == 'Credit'), s => s.qty * s.rate) - sum(S.cpay.filter(x => x.cust == c.id), 'amount');
const sbal = s => sum(S.purchases.filter(x => x.supplier == s.id), p => p.qty * p.rate) - sum(S.spay.filter(x => x.supplier == s.id), 'amount');
const opts = (a, sel) => a.map(x => `<option value="${x.id}" ${x.id==sel?'selected':''}>${x.name}</option>`).join('');
const tbl = (h, r, e = 'Nothing here yet. Add your first entry above.') => r.length ? `<table><tr>${h.map(x=>`<th class="${x[0]=='>'?'r':''}">${
  x.replace('>',
  '')
}
</th>`).join('')}</tr>${r.join('')}</table>` : `<p class="sub">${e}</p>`;
const del = (k, id) => {
  if (k == 'purchases') {
    const p = S.purchases.find(x => x.id == id);
    if (stock(F(p.fuel)) - p.qty < 0) {
      alert('Cannot delete: stock would go negative.');
      return
    }
  }
  ask('Delete this entry? This cannot be undone.',
    () => {
      S[k] = S[k].filter(x => x.id != id);
      commit('Deleted')
    })
};
const X = (k, id) => `<td class="r"><button class="x" title="Delete" onclick="del('${k}','${id}')">Delete</button></td>`;

function toast(m) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = m;
  document.body.append(t);
  setTimeout(() => t.remove(), 1800)
}

function commit(m) {
  save();
  $('#modal').innerHTML = '';
  render();
  toast(m)
}
const fld = (l, h) => `<label>${l}${h}</label>`,
  inp = (n, t = 'text', v = '', x = '') => `<input name="${n}" type="${t}" value="${v}" ${x}>`;
const hd = (t, s, b = '') => `<div class="top"><div><h1>${t}</h1><div class="sub">${s}</div></div>${b}</div>`;
const stat = (c, l, v) => `<div class="card stat ${c}"><span>${l}</span><b>${v}</b></div>`;
let cur = 'dash',
  rd = td,
  rm = td.slice(0, 7);
const NAV = [
  ['dash', '▦', 'Dashboard'],
  ['stock', '⛽', 'Fuel & Stock'],
  ['purch', '⬇', 'Purchases'],
  ['sales', '⬆', 'Daily Sales'],
  ['cust', '☺', 'Customers & Credit'],
  ['pay', '₨', 'Payments'],
  ['sup', '⚑', 'Suppliers'],
  ['exp', '✎', 'Expenses'],
  ['rep', '▤', 'Reports']
];
const go = v => {
  cur = v;
  render();
  scrollTo(0, 0)
};
const V = {};
V.dash = () => {
  const ts = S.sales.filter(s => s.date == td),
    tp = S.purchases.filter(s => s.date == td);
  const days = [6,
      5,
      4,
      3,
      2,
      1,
      0
    ].map(n => {
      const d = dd(n);
      return [d.slice(5),
        sum(S.sales.filter(s => s.date == d), s => s.qty * s.rate)
      ]
    }),
    mx = Math.max(...days.map(d => d[1]), 1);
  const rec = [...S.sales.map(s => ({
    ...s,
    t: 'Sale'
  })), ...S.purchases.map(s => ({
    ...s,
    t: 'Purchase'
  }))].reverse().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  const salesAmount = sum(ts, sale => sale.qty * sale.rate);
  const stockSellingValue = sum(S.fuels, fuel => stock(fuel) * fuel.rate);
  const priceLine = amount => `<small style="display:block;font:600 12px Inter,sans-serif;color:var(--mut);margin-top:4px">RS PRICE: ${Rs(amount)}</small>`;
  return hd('Dashboard', 'Your station at a glance — ' + td) + `<div class="sgrid">${stat('a','Total stock',fmt(sum(S.fuels,stock))+' L')}${stat('b',"Today's sales",fmt(sum(ts,'qty'))+' L<br>'+priceLine(salesAmount))}${stat('c',"Today's purchase",fmt(sum(tp,'qty'))+' L · '+Rs(sum(tp,s=>s.qty*s.rate)))}${stat('d','Customer credit',Rs(sum(S.customers,cbal)))}${stat('b',"Today's profit (est.)",Rs(sum(ts,s=>s.qty*(s.rate-F(s.fuel).cost))-sum(S.expenses.filter(e=>e.date==td),'amount')))}${stat('a stock-value-stat','Stock value (selling)',Rs(stockSellingValue))}</div>
<div class="two"><div class="card"><h3>Sales, last 7 days</h3><p class="sub">Rupees per day</p><div class="chart">${days.map(d=>`<div><span>${
    d[1]?fmt(d[1]/1000)+'k':''
  }
  </span><i style="height:${d[1]/mx*80}%"></i>${
    d[0]
  }
  </div>`).join('')}</div></div>
<div class="card"><h3>Current stock</h3><div class="fl" style="margin-top:12px">${S.fuels.map(f=>{const s=stock(f);return`<div><span><b>${
    f.name
  }
  </b> — ${
    fmt(s)
  }
   L ${
    s<f.min?'<span class="tag o">Low stock</span>':''
  }
  </span><div class="bar ${s<f.min?'low':''}"><i style="width:${Math.min(100,s/(f.min*5)*100)}%"></i></div></div>`}).join('')}</div></div></div>
<div class="card"><h3>Recent transactions</h3>${tbl(['Date','Type','Fuel','>Quantity','>Rate','>Total'],rec.map(r=>`<tr><td>${
    r.date
  }
  </td><td><span class="tag ${r.t=='Sale'?'g':'y'}">${
    r.t
  }
  </span></td><td>${
    F(r.fuel).name
  }
  </td><td class="r">${
    fmt(r.qty)
  }
   L</td><td class="r">${
    r.rate
  }
  </td><td class="r">${
    Rs(r.qty*r.rate)
  }
  </td></tr>`))}</div>`
};
V.stock = () => hd('Fuel & Stock', 'Opening + purchases − sales = current stock') + `<div class="sgrid">${S.fuels.map(f=>{const s=stock(f);return`<div class="card"><h3>${
  f.name
}
</h3><p class="tot">${
  fmt(s)
}
 L</p><div class="sub">Selling stock value: ${
  Rs(s*f.rate)
}
<br>Cost stock value: ${
  Rs(s*f.cost)
}
</div></div>`}).join('')}</div>
<div class="card"><h3>Fuel rates & settings</h3><p class="sub">Edit the values and save. Selling and cost rates are kept separately for stock valuation.</p>${tbl(['Fuel','Opening stock (L)','Selling rate','Cost rate','Minimum stock (L)','>Actions'],S.fuels.map(f=>`<tr><td><b>${
  f.name
}
</b></td>${
  ['open',
  'rate',
  'cost',
  'min'].map(k=>`<td><input type="number" step="any" value="${f[k]}" onchange="setF('${f.id}','${k}',this.value)"></td>`).join('')
}
<td></td></tr>`))}</div>
<div class="card"><h3>Stock history</h3>${tbl(['Date','Fuel','Opening','>Purchased','>Sold','>Closing'],histRows())}</div>`;
const setF = (id, k, v) => {
  F(id)[k] = +v;
  commit('Saved')
};

function histRows() {
  const ds = [...new Set([...S.sales, ...S.purchases].map(x => x.date))].sort().reverse().slice(0, 15),
    r = [];
  ds.forEach(d => S.fuels.forEach(f => {
    const p = sum(S.purchases.filter(x => x.date == d && x.fuel == f.id), 'qty'),
      s = sum(S.sales.filter(x => x.date == d && x.fuel == f.id), 'qty');
    if (p || s) r.push(`<tr><td>${d}</td><td>${f.name}</td><td class="r">${fmt(opening(f,d))}</td><td class="r">${fmt(p)}</td><td class="r">${fmt(s)}</td><td class="r"><b>${fmt(opening(f,d)+p-s)}</b></td></tr>`)
  }));
  return r
}
V.purch = () => hd('Purchases', 'Record every tanker that arrives') + `<div class="card"><form data-f="purch">${fld('Fuel type',`<select name="fuel">${
  opts(S.fuels)
}
</select>`)}${fld('Quantity (L)',inp('qty','number','','step=any min=1 required'))}${fld('Purchase rate (Rs/L)',inp('rate','number',S.fuels[0].cost,'step=any required'))}${fld('Supplier',`<select name="supplier">${
  opts(S.suppliers)
}
</select>`)}${fld('Date',inp('date','date',td,'required'))}${fld('Invoice number',inp('inv'))}${fld('Total cost','<div class="tot" id="tot">Rs. 0</div>')}<button class="btn ac">Save purchase</button></form></div>
<div class="card">${tbl(['Date','Fuel','Supplier','Invoice','>Qty','>Rate','>Total','>Actions'],[...S.purchases].reverse().sort((a,b)=>b.date.localeCompare(a.date)).map(p=>`<tr><td>${
  p.date
}
</td><td>${
  F(p.fuel).name
}
</td><td>${
  Su(p.supplier)?.name||'-'
}
</td><td>${
  p.inv||''
}
</td><td class="r">${
  fmt(p.qty)
}
 L</td><td class="r">${
  p.rate
}
</td><td class="r">${
  Rs(p.qty*p.rate)
}
</td>${
  X('purchases',
  p.id)
}
</tr>`))}</div>`;
V.sales = () => hd('Daily Sales', 'Enter litres directly, or use meter readings') + `<div class="card"><form data-f="sale">${fld('Date',inp('date','date',td,'required'))}${fld('Fuel',`<select name="fuel">${
  opts(S.fuels)
}
</select>`)}${fld('Opening meter',inp('om','number','','step=any'))}${fld('Closing meter',inp('cm','number','','step=any'))}${fld('Litres sold',inp('qty','number','','step=any min=0.1 required'))}${fld('Selling rate (Rs/L)',inp('rate','number',S.fuels[0].rate,'step=any required'))}${fld('Payment',`<select name="pay"><option>Cash</option><option>Credit</option></select>`)}${fld('Customer (for credit)',`<select name="cust"><option value="">Walk-in</option>${
  opts(S.customers)
}
</select>`)}${fld('Total sale','<div class="tot" id="tot">Rs. 0</div>')}<button class="btn ac">Save sale</button></form></div>
<div class="card">${tbl(['Date','Fuel','Customer','Payment','>Litres','>Rate','>Total','>Actions'],[...S.sales].reverse().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,60).map(p=>`<tr><td>${
  p.date
}
</td><td>${
  F(p.fuel).name
}
</td><td>${
  C(p.cust)?.name||'Walk-in'
}
</td><td><span class="tag ${p.pay=='Cash'?'g':'o'}">${
  p.pay
}
</span></td><td class="r">${
  fmt(p.qty)
}
</td><td class="r">${
  p.rate
}
</td><td class="r">${
  Rs(p.qty*p.rate)
}
</td>${
  X('sales',
  p.id)
}
</tr>`))}</div>`;
V.cust = () => hd('Customers & Credit', 'Who owes you money') + `<div class="card"><form data-f="cust">${fld('Name',inp('name','text','','required'))}${fld('Phone',inp('phone'))}${fld('Address',inp('address'))}${fld('Opening balance (Rs)',inp('open','number','0','step=any'))}<button class="btn ac">Add customer</button></form></div>
<div class="card">${tbl(['Customer','Phone','>Credit taken','>Paid','>Balance','>Actions'],S.customers.map(c=>{const cr=sum(S.sales.filter(x=>x.cust==c.id&&x.pay=='Credit'),s=>s.qty*s.rate)+c.open,pd=sum(S.cpay.filter(x=>x.cust==c.id),'amount');return`<tr><td><b>${
  c.name
}
</b></td><td>${
  c.phone||''
}
</td><td class="r">${
  Rs(cr)
}
</td><td class="r">${
  Rs(pd)
}
</td><td class="r"><span class="tag ${cr-pd>0?'o':'g'}">${
  Rs(cr-pd)
}
</span></td><td class="r"><button class="btn ghost" onclick="prof('${c.id}')">Profile</button></td></tr>`}),'No customers yet. Add one above.')}</div>`;

function prof(id) {
  const c = C(id),
    tx = [...S.sales.filter(x => x.cust == id).map(s => ({
      d: s.date,
      t: F(s.fuel).name + ' ' + fmt(s.qty) + ' L',
      a: s.qty * s.rate,
      st: s.pay
    })), ...S.cpay.filter(x => x.cust == id).map(p => ({
      d: p.date,
      t: 'Payment (' + p.method + ')',
      a: -p.amount,
      st: 'Received'
    }))].sort((a, b) => b.d.localeCompare(a.d));
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card"><div class="top"><div><h2>${c.name}</h2><div class="sub">${c.phone||''} ${c.address?'· '+c.address:''}</div></div><button class="btn ghost" onclick="$('#modal').innerHTML=''">Close</button></div><p>Outstanding balance</p><p class="tot">${Rs(cbal(c))}</p><form data-f="cpay"><input type="hidden" name="cust" value="${id}">${fld('Amount received',inp('amount','number','','required min=1'))}${fld('Method',`<select name="method"><option>Cash</option><option>Bank</option><option>Easypaisa/JazzCash</option></select>`)}${fld('Date',inp('date','date',td))}<button class="btn ac">Receive payment</button></form><br>${tbl(['Date','Details','>Amount','Status'],tx.map(t=>`<tr><td>${
    t.d
  }
  </td><td>${
    t.t
  }
  </td><td class="r">${
    Rs(Math.abs(t.a))
  }
  </td><td><span class="tag ${t.a<0||t.st=='Cash'?'g':'o'}">${
    t.st
  }
  </span></td></tr>`),'No transactions yet.')}</div></div>`
}
V.pay = () => hd('Payments', 'Money in from customers, money out to suppliers') + `<div class="two"><div class="card"><h3>Receive customer payment</h3><br><form data-f="cpay">${fld('Customer',`<select name="cust">${
  opts(S.customers)
}
</select>`)}${fld('Amount (Rs)',inp('amount','number','','required min=1'))}${fld('Method',`<select name="method"><option>Cash</option><option>Bank</option></select>`)}${fld('Date',inp('date','date',td))}${fld('Notes',inp('notes'))}<button class="btn ac">Save payment</button></form></div>
<div class="card"><h3>Pay supplier</h3><br><form data-f="spay">${fld('Supplier',`<select name="supplier">${
  opts(S.suppliers)
}
</select>`)}${fld('Amount (Rs)',inp('amount','number','','required min=1'))}${fld('Method',`<select name="method"><option>Bank</option><option>Cash</option></select>`)}${fld('Date',inp('date','date',td))}<button class="btn ac">Save payment</button></form></div></div>
<div class="two one"><div class="card"><h3>Received</h3>${tbl(['Date','Customer','>Amount','>Actions'],[...S.cpay].reverse().sort((a,b)=>b.date.localeCompare(a.date)).map(p=>`<tr><td>${
  p.date
}
</td><td>${
  C(p.cust)?.name
}
</td><td class="r">${
  Rs(p.amount)
}
</td>${
  X('cpay',
  p.id)
}
</tr>`))}</div>
<div class="card"><h3>Paid out</h3>${tbl(['Date','Supplier','>Amount','>Actions'],[...S.spay].reverse().sort((a,b)=>b.date.localeCompare(a.date)).map(p=>`<tr><td>${
  p.date
}
</td><td>${
  Su(p.supplier)?.name
}
</td><td class="r">${
  Rs(p.amount)
}
</td>${
  X('spay',
  p.id)
}
</tr>`))}</div></div>`;
V.sup = () => hd('Suppliers', 'How much you owe each supplier') + `<div class="card"><form data-f="sup">${fld('Supplier name',inp('name','text','','required'))}${fld('Contact',inp('phone'))}<button class="btn ac">Add supplier</button></form></div><div class="card">${tbl(['Supplier','Contact','>Total purchases','>Paid','>Payable'],S.suppliers.map(s=>{const t=sum(S.purchases.filter(x=>x.supplier==s.id),p=>p.qty*p.rate),p=sum(S.spay.filter(x=>x.supplier==s.id),'amount');return`<tr><td><b>${
  s.name
}
</b></td><td>${
  s.phone||''
}
</td><td class="r">${
  Rs(t)
}
</td><td class="r">${
  Rs(p)
}
</td><td class="r"><span class="tag ${t-p>0?'o':'g'}">${
  Rs(t-p)
}
</span></td></tr>`}))}</div>`;
V.exp = () => hd('Expenses', 'Running costs of the station') + `<div class="card"><form data-f="exp">${fld('Category',`<select name="cat">${
  ['Electricity',
  'Generator Fuel',
  'Staff Salary',
  'Maintenance',
  'Cleaning',
  'Transport',
  'Other'].map(c=>`<option>${c}</option>`).join('')
}
</select>`)}${fld('Amount (Rs)',inp('amount','number','','required min=1'))}${fld('Date',inp('date','date',td))}${fld('Description',inp('desc'))}<button class="btn ac">Save expense</button></form></div><div class="card">${tbl(['Date','Category','Description','>Amount','>Actions'],[...S.expenses].reverse().sort((a,b)=>b.date.localeCompare(a.date)).map(e=>`<tr><td>${
  e.date
}
</td><td>${
  e.cat
}
</td><td>${
  e.desc||''
}
</td><td class="r">${
  Rs(e.amount)
}
</td>${
  X('expenses',
  e.id)
}
</tr>`))}</div>`;
V.rep = () => {
  const m = (k, ok) => S[k].filter(x => ok(x.date)),
    blk = (ok, from) => {
      const pu = m('purchases', ok),
        sa = m('sales', ok),
        ex = m('expenses', ok),
        sl = sum(sa, s => s.qty * s.rate),
        gp = sum(sa, s => s.qty * (s.rate - F(s.fuel).cost)),
        exp = sum(ex, 'amount');
      return `<div class="card">${tbl(['Fuel','>Opening','>Purchased','>Available','>Sold','>Closing'],S.fuels.map(f=>{const o=opening(f,from),p=sum(pu.filter(x=>x.fuel==f.id),'qty'),s=sum(sa.filter(x=>x.fuel==f.id),'qty');return`<tr><td><b>${
      f.name
    }
    </b></td><td class="r">${
      fmt(o)
    }
     L</td><td class="r">${
      fmt(p)
    }
     L</td><td class="r">${
      fmt(o+p)
    }
     L</td><td class="r">${
      fmt(s)
    }
     L</td><td class="r"><b>${
      fmt(o+p-s)
    }
     L</b></td></tr>`}))}</div><div class="sgrid">${stat('b','Total sales',Rs(sl))}${stat('c','Purchases',Rs(sum(pu,p=>p.qty*p.rate)))}${stat('d','Expenses',Rs(exp))}${stat('a','Net (sales − expenses)',Rs(sl-exp))}${stat('b','Est. profit (margin − expenses)',Rs(gp-exp))}${stat('c','Credit sales',Rs(sum(sa.filter(s=>s.pay=='Credit'),s=>s.qty*s.rate)))}</div>`
    };
  return hd('Reports', 'Daily and monthly summaries', '<div class="acts no"><button class="btn ghost" onclick="askPrint(0)">Print daily report</button><button class="btn ac" onclick="monthRep()">Monthly report</button></div>') + `<h3>Daily report</h3><p><input type="date" style="width:auto" value="${rd}" onchange="rd=this.value;render()"></p>${blk(d=>d==rd,rd)}<br><h3>Monthly report</h3><p><input type="month" style="width:auto" value="${rm}" onchange="rm=this.value;render()"></p>${blk(d=>d.slice(0,7)==rm,rm+'-01')}
<div class="card"><h3>Customer report</h3>${tbl(['Customer','>Balance'],S.customers.filter(c=>cbal(c)>0).map(c=>`<tr><td>${
    c.name
  }
  </td><td class="r">${
    Rs(cbal(c))
  }
  </td></tr>`),'No outstanding balances.')}</div>`
};
const H = {
  purch: d => S.purchases.push({
    id: uid(),
    date: d.date,
    fuel: d.fuel,
    qty: +d.qty,
    rate: +d.rate,
    supplier: d.supplier,
    inv: d.inv
  }) && 'Purchase saved',
  sale: d => {
    const f = F(d.fuel);
    if (+d.qty > stock(f)) {
      alert('Only ' + fmt(stock(f)) + ' L of ' + f.name + ' in stock.');
      return
    }
    if (d.pay == 'Credit' && !d.cust) {
      alert('Select a customer for credit sales.');
      return
    }
    S.sales.push({
      id: uid(),
      date: d.date,
      fuel: d.fuel,
      qty: +d.qty,
      rate: +d.rate,
      cust: d.cust,
      pay: d.pay,
      om: +d.om,
      cm: +d.cm
    });
    return 'Sale saved'
  },
  cust: d => S.customers.push({
    id: uid(),
    name: d.name,
    phone: d.phone,
    address: d.address,
    open: +d.open
  }) && 'Customer added',
  cpay: d => {
    S.cpay.push({
      id: uid(),
      cust: d.cust,
      amount: +d.amount,
      method: d.method,
      date: d.date,
      notes: d.notes || ''
    });
    $('#modal').innerHTML = '';
    return 'Payment saved'
  },
  spay: d => S.spay.push({
    id: uid(),
    supplier: d.supplier,
    amount: +d.amount,
    method: d.method,
    date: d.date
  }) && 'Payment saved',
  sup: d => S.suppliers.push({
    id: uid(),
    name: d.name,
    phone: d.phone
  }) && 'Supplier added',
  exp: d => S.expenses.push({
    id: uid(),
    cat: d.cat,
    amount: +d.amount,
    date: d.date,
    desc: d.desc
  }) && 'Expense saved'
};
document.addEventListener('submit', e => {
  e.preventDefault();
  const m = H[e.target.dataset.f]((fd => Object.assign(Object.fromEntries(fd), {
    _fd: fd
  }))(new FormData(e.target)));
  if (m) commit(m)
});
document.addEventListener('input', e => {
  const f = e.target.form;
  if (!f || !f.dataset.f) return;
  const k = f.dataset.f,
    g = n => f.elements[n];
  if (e.target.name == 'fuel' && (k == 'sale' || k == 'credit')) g('rate').value = F(e.target.value)[k == 'purch' ? 'cost' : 'rate'];
  if (k == 'sale' && g('om').value !== '' && g('cm').value !== '') g('qty').value = Math.max(0, +g('cm').value - +g('om').value).toFixed(1);
  if (g('qty') && $('#tot')) $('#tot').textContent = Rs((+g('qty').value || 0) * (+g('rate').value || 0))
});

function render() {
  $('#nav').innerHTML = `<div class="brand"><i>⛽</i>Petrol Station</div>` + NAV.map(n => `<button class="${n[0]==cur?'on':''}" title="${n[2]}" onclick="go('${n[0]}')"><span>${n[1]}</span>${n[2]}</button>`).join('');
  $('#main').innerHTML = V[cur]()
}
render();
const FORMS = {},
  LBL = {
    purch: 'Add purchase',
    sale: 'Add sale',
    cust: 'Add customer',
    cpay: 'Receive payment',
    spay: 'Pay supplier',
    sup: 'Add supplier',
    exp: 'Add expense',
    credit: 'Give credit'
  };
const lab = r => r.querySelectorAll('table').forEach(t => {
  const h = [...t.rows[0].cells].map(c => c.textContent);
  [...t.rows].slice(1).forEach(r => [...r.cells].forEach((c, i) => c.dataset.label = h[i] || ''))
});

function post() {
  const m = $('#main'),
    top = m.querySelector('.top'),
    a = document.createElement('div');
  a.className = 'acts no';
  m.querySelectorAll('form[data-f]').forEach(f => {
    const k = f.dataset.f;
    FORMS[k] = f.outerHTML;
    f.closest('.card').remove();
    const b = document.createElement('button');
    b.className = 'btn ac';
    b.textContent = '+ ' + LBL[k];
    b.onclick = () => openForm(k);
    a.append(b)
  });
  top.append(a);
  m.querySelectorAll('.two').forEach(t => {
    if (!t.children.length) t.remove()
  });
  lab(m)
}

function openForm(k, pre) {
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card"><div class="top"><h2>${LBL[k]}</h2><button class="btn ghost" onclick="$('#modal').innerHTML=''">Close</button></div>${FORMS[k]}</div></div>`;
  const f = $('#modal form');
  if (pre && f.elements.cust) f.elements.cust.value = pre;
  const q = f.querySelector('input:not([type=hidden]),select');
  q && q.focus()
}
const _r = render;
render = function() {
  mig();
  _r();
  post();
  if (cur == 'rep') {
    $('#rm').remove();
    $('#main').lastElementChild.remove()
  }
};
const _p = prof;
prof = function(id) {
  _p(id);
  const t = $('#modal .top'),
    b = document.createElement('button');
  b.className = 'btn ac';
  b.textContent = '+ Give credit';
  b.onclick = () => openForm('credit', id);
  t.prepend(b);
  t.style.gap = '8px';
  $('#modal .card').insertAdjacentHTML('beforeend', '<br><h3>Credit invoices</h3>' + invTbl(S.sales.filter(x => x.cust == id && x.pay == 'Credit')));
  lab($('#modal'))
};
const _c = V.cust;
V.cust = () => _c().replace('<button class="btn ac">Add customer</button>', fld('Credit limit (Rs, 0 = none)', inp('limit', 'number', '0', 'min=0')) + '<button class="btn ac">Add customer</button>') + `<div class="card"><h3>Credit invoices</h3>${invTbl(S.sales.filter(s=>s.pay=='Credit'&&C(s.cust)))}</div><div class="card"><form data-f="credit">${fld('Customer',`<select name="cust" required>${
  opts(S.customers)
}
</select>`)}${fld('Fuel',`<select name="fuel">${
  opts(S.fuels)
}
</select>`)}${fld('Litres',inp('qty','number','','step=any min=0.1 required'))}${fld('Rate (Rs/L)',inp('rate','number',S.fuels[0].rate,'step=any required'))}${fld('Vehicle / note',inp('note'))}${fld('Date',inp('date','date',td,'required'))}${fld('Credit amount','<div class="tot" id="tot">Rs. 0</div>')}<button class="btn ac">Save credit</button></form></div>`;
const _pv = V.purch;
V.purch = () => _pv().replace('<button class="btn ac">Save purchase</button>', fld('Paid now (Rs)', inp('paid', 'number', '0', 'min=0 step=any')) + '<button class="btn ac">Save purchase</button>');
const fut = d => d.date > td && (alert('Date cannot be in the future.'), 1);
const _cu = H.cust;
H.cust = d => {
  const m = _cu(d);
  S.customers[S.customers.length - 1].limit = +d.limit || 0;
  return m
};
const _pu = H.purch;
H.purch = d => {
  if (fut(d)) return;
  const t = d.qty * d.rate;
  const m = _pu(d);
  if (+d.paid > 0 && d.supplier) S.spay.push({
    id: uid(),
    supplier: d.supplier,
    amount: Math.min(+d.paid, t),
    method: 'Cash',
    date: d.date,
    notes: 'Paid with ' + (d.inv || 'purchase')
  });
  return m
};
const _sl = H.sale;
H.sale = d => {
  if (fut(d)) return;
  const c = C(d.cust);
  if (d.pay == 'Credit' && c && c.limit && cbal(c) + d.qty * d.rate > c.limit && !d.ok) {
    ask(c.name + "'s credit limit of " + Rs(c.limit) + ' will be exceeded. Continue?',
      () => {
        const m = H.sale({
          ...d,
          ok: 1
        });
        m && commit(m)
      }, 'Continue');
    return
  }
  return _sl(d)
};
H.credit = d => {
  if (fut(d)) return;
  const f = F(d.fuel),
    c = C(d.cust);
  if (!c) {
    alert('Add a customer first.');
    return
  }
  const a = +d.qty * +d.rate;
  if (+d.qty > stock(f)) {
    alert('Only ' + fmt(stock(f)) + ' L of ' + f.name + ' in stock.');
    return
  }
  if (c.limit && cbal(c) + a > c.limit && !d.ok) {
    ask(c.name + "'s credit limit of " + Rs(c.limit) + ' will be exceeded. Continue?',
      () => {
        const m = H.credit({
          ...d,
          ok: 1
        });
        m && commit(m)
      }, 'Continue');
    return
  }
  S.sales.push({
    id: uid(),
    date: d.date,
    fuel: d.fuel,
    qty: +d.qty,
    rate: +d.rate,
    cust: d.cust,
    pay: 'Credit',
    om: 0,
    cm: 0,
    note: d.note
  });
  return 'Credit added to ' + c.name
};
NAV.push(['set', '⚙', 'Settings']);
NAV.forEach(n => n[1] = {
    dash: '📊',
    stock: '⛽',
    purch: '🚚',
    sales: '💰',
    cust: '👥',
    pay: '💳',
    sup: '🏭',
    exp: '🧾',
    rep: '📈',
    set: '⚙️'
  }
  [n[0]]);
const _rp = V.rep;
V.rep = () => _rp().replace('<h3>Daily report</h3>', '<div id="rd" class="rs"><h3>Daily report <span class="ph"></span></h3>').replace('<br><h3>Monthly report</h3>', '</div><div id="rm" class="rs"><h3>Monthly report <span class="ph"></span></h3>').replace('<div class="card"><h3>Customer report</h3>', '</div><div class="card"><h3>Customer report</h3>');

function mig() {
  S.fuels = S.fuels.filter(f => f.name != 'High Octane');
  const ok = new Set(S.fuels.map(f => f.id));
  ['purchases', 'sales'].forEach(k => S[k] = S[k].filter(x => ok.has(x.fuel)));
  S.invn = S.invn || 0;
  S.sales.filter(s => s.pay == 'Credit' && !s.no).sort((a, b) => a.date.localeCompare(b.date)).forEach(s => s.no = 'INV-' + String(++S.invn).padStart(4, '0'));
  save()
}
const alloc = c => {
  let pool = Math.max(0, sum(S.cpay.filter(x => x.cust == c.id), 'amount') - c.open),
    o = {};
  S.sales.filter(s => s.cust == c.id && s.pay == 'Credit').sort((a, b) => a.date.localeCompare(b.date) || (a.no || '').localeCompare(b.no || '')).forEach(s => {
    const p = Math.min(s.qty * s.rate, pool);
    o[s.id] = p;
    pool -= p
  });
  return o
};
const invTbl = l => {
  const al = {},
    g = c => al[c.id] || (al[c.id] = alloc(c));
  return tbl(['Invoice', 'Date', 'Customer', '>Total', '>Paid', '>Remaining', 'Status', '>Actions'],
    [...l].sort((a, b) => b.date.localeCompare(a.date) || (b.no || '').localeCompare(a.no || '')).map(s => {
      const c = C(s.cust),
        t = s.qty * s.rate,
        p = g(c)[s.id] || 0,
        r = t - p;
      return `<tr><td><b>${s.no||''}</b></td><td>${s.date}</td><td>${c.name}</td><td class="r">${Rs(t)}</td><td class="r">${Rs(p)}</td><td class="r">${Rs(r)}</td><td><span class="tag ${r<=0?'g':p>0?'y':'o'}">${r<=0?'Paid':p>0?'Partial':'Unpaid'}</span></td><td class="r"><button class="btn ghost" onclick="openInv('${s.id}')">View</button> <button class="btn ghost" onclick="openInv('${s.id}',1)">Edit</button> <button class="x" onclick="del('sales','${s.id}')">Delete</button></td></tr>`
    }), 'No credit invoices yet.')
};

function openInv(id, ed) {
  const s = S.sales.find(x => x.id == id),
    c = C(s.cust),
    t = s.qty * s.rate,
    p = alloc(c)[id] || 0,
    r = t - p;
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card"><div class="top no"><h2>${ed?'Edit invoice '+s.no:'Invoice'}</h2><div class="acts">${ed?'':`<button class="btn ac" onclick="openInv('${id}',1)">Edit</button><button class="btn" onclick="document.body.className='pi';print()">Print</button>`}<button class="btn ghost" onclick="prof('${c.id}')">👤 Profile</button><button class="btn ghost" onclick="$('#modal').innerHTML=''">Close</button></div></div>` + (ed ? `<form data-f="invedit"><input type="hidden" name="id" value="${id}">${fld('Date',inp('date','date',s.date,'required'))}${fld('Fuel',`<select name="fuel">${
    opts(S.fuels,
    s.fuel)
  }
  </select>`)}${fld('Litres',inp('qty','number',s.qty,'step=any min=0.1 required'))}${fld('Rate (Rs/L)',inp('rate','number',s.rate,'step=any required'))}${fld('Vehicle / note',inp('note','text',s.note||''))}<button class="btn ac">Save invoice</button></form>` : `<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px"><div><h2>Petrol Station</h2><div class="sub">Credit invoice</div></div><div style="text-align:right"><b>${s.no}</b><div class="sub">Date: ${s.date}</div></div></div><hr style="border:0;border-top:1px solid var(--ln)"><p><b>Customer:</b> ${c.name} ${c.phone?'· '+c.phone:''}</p>${tbl(['Fuel','>Litres','>Rate','>Amount'],[`<tr><td>${
    F(s.fuel).name
  }
  </td><td class="r">${
    fmt(s.qty)
  }
  </td><td class="r">${
    s.rate
  }
  </td><td class="r">${
    Rs(t)
  }
  </td></tr>`])}${s.note?`<p class="sub">Note: ${
    s.note
  }
  </p>`:''}<br><div class="sgrid">${stat('a','Bill total',Rs(t))}${stat('b','Paid',Rs(p))}${stat('d','Remaining',Rs(r))}</div><p>Status: <span class="tag ${r<=0?'g':p>0?'y':'o'}">${r<=0?'Paid':p>0?'Partial':'Unpaid'}</span> &nbsp; <span class="sub">Customer total outstanding: ${Rs(cbal(c))}</span></p>`) + `</div></div>`;
  lab($('#modal'))
}
H.invedit = d => {
  if (fut(d)) return;
  const s = S.sales.find(x => x.id == d.id),
    av = stock(F(d.fuel)) + (s.fuel == d.fuel ? s.qty : 0);
  if (+d.qty > av) {
    alert('Only ' + fmt(av) + ' L in stock.');
    return
  }
  Object.assign(s, {
    date: d.date,
    fuel: d.fuel,
    qty: +d.qty,
    rate: +d.rate,
    note: d.note
  });
  setTimeout(() => openInv(d.id), 0);
  return 'Invoice updated'
};

function printAsk() {
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card"><h2>Print report</h2><p class="sub">Which report do you want to print?</p><div class="acts"><button class="btn ac" onclick="printRep('d')">Daily report (${rd})</button><button class="btn" onclick="printRep('m')">Monthly report (${rm})</button><button class="btn ghost" onclick="$('#modal').innerHTML=''">Cancel</button></div></div></div>`
}

function printRep(k) {
  $('#modal').innerHTML = '';
  document.querySelectorAll('.ph').forEach(e => e.textContent = '');
  $('#r' + k).querySelector('.ph').textContent = '— ' + (k == 'd' ? rd : rm);
  document.body.className = 'pr rp-' + k;
  print()
}
onafterprint = () => {
  document.body.className = ''
};
document.body.insertAdjacentHTML('beforeend', '<div id="dlg"></div>');
const dlg = x => {
  $('#dlg').innerHTML = x ? `<div class="modal" style="z-index:30"><div class="card" style="max-width:400px">${x}</div></div>` : ''
};

function ask(m, yes, l = 'Delete') {
  dlg(`<h3>Please confirm</h3><p>${m}</p><div class="acts" style="justify-content:flex-end"><button class="btn ghost" onclick="dlg()">Cancel</button><button class="btn ${l=='Delete'?'':'ac'}" ${l=='Delete'?'style="background:var(--rd)"':''} id="yes">${l}</button></div>`);
  $('#yes').onclick = () => {
    dlg();
    yes()
  }
}
window.alert = m => dlg(`<h3>Notice</h3><p>${m}</p><div class="acts" style="justify-content:flex-end"><button class="btn ac" onclick="dlg()">OK</button></div>`);
let hf = '';

function hist() {
  const r = [];
  [...new Set([...S.sales, ...S.purchases].map(x => x.date))].sort().reverse().slice(0, 20).forEach(d => S.fuels.filter(f => !hf || f.id == hf).forEach(f => {
    const p = sum(S.purchases.filter(x => x.date == d && x.fuel == f.id), 'qty'),
      s = sum(S.sales.filter(x => x.date == d && x.fuel == f.id), 'qty'),
      o = opening(f, d);
    if (p || s) r.push(`<tr><td>${d}</td><td><b>${f.name}</b></td><td class="r">${fmt(o)} L</td><td class="r" style="color:var(--gr)">${p?'+'+fmt(p)+' L':'–'}</td><td class="r" style="color:var(--rd)">${s?'−'+fmt(s)+' L':'–'}</td><td class="r"><b>${fmt(o+p-s)} L</b></td></tr>`)
  }));
  return r
}
V.stock = () => hd('Fuel & Stock', 'Opening + purchases − sales = current stock') + `<div class="sgrid">${S.fuels.map(f=>{const s=stock(f);return`<div class="card"><h3>${
  f.name
}
</h3><p class="tot">${
  fmt(s)
}
 L ${
  s<f.min?'<span class="tag o">Low stock</span>':''
}
</p><div class="sub">Selling value: ${
  Rs(s*f.rate)
}
<br>Cost value: ${
  Rs(s*f.cost)
}
</div></div>`}).join('')}</div>
<div class="card"><h3>Fuel rates & settings</h3>${tbl(['Fuel','>Selling rate','>Cost rate','>Margin / L','>Minimum stock','>Actions'],S.fuels.map(f=>`<tr><td><b>${
  f.name
}
</b></td><td class="r">${
  Rs(f.rate)
}
</td><td class="r">${
  Rs(f.cost)
}
</td><td class="r">${
  Rs(f.rate-f.cost)
}
</td><td class="r">${
  fmt(f.min)
}
 L</td><td class="r"><button class="btn ghost" onclick="openFuel('${f.id}')">✎ Edit price</button></td></tr>`))}</div>
<div class="card"><div class="top" style="margin-bottom:10px"><h3>Stock history</h3><select style="width:auto" onchange="hf=this.value;render()"><option value="">All fuels</option>${opts(S.fuels,hf)}</select></div>${tbl(['Date','Fuel','>Opening','>Purchased','>Sold','>Closing'],hist(),'No stock movement yet.')}</div>`;

function openFuel(id) {
  const f = F(id);
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card" style="max-width:480px"><div class="fhead"><i>⛽</i><div><h2>${f.name}</h2><div>Current stock: ${fmt(stock(f))} L</div></div></div><form data-f="fuelset" style="grid-template-columns:1fr 1fr"><input type="hidden" name="id" value="${id}">${fld('Selling rate (Rs/L)',inp('rate','number',f.rate,'step=any min=0 required'))}${fld('Cost rate (Rs/L)',inp('cost','number',f.cost,'step=any min=0 required'))}${fld('Minimum stock alert (L)',inp('min','number',f.min,'min=0 required'))}${fld('Opening stock (L)',inp('open','number',f.open,'step=any required'))}<div style="grid-column:1/-1" class="sub">Margin per litre: <b id="mg">${Rs(f.rate-f.cost)}</b></div><div class="acts" style="grid-column:1/-1;justify-content:flex-end"><button type="button" class="btn ghost" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn ac">Save changes</button></div></form></div></div>`
}
H.fuelset = d => {
  if (!(+d.rate > 0)) {
    alert('Enter a valid selling rate.');
    return
  }
  Object.assign(F(d.id), {
    rate: +d.rate,
    cost: +d.cost,
    min: +d.min,
    open: +d.open
  });
  return F(d.id).name + ' updated'
};
document.addEventListener('input', e => {
  const f = e.target.form;
  if (f && f.dataset.f == 'fuelset' && $('#mg')) $('#mg').textContent = Rs(f.elements.rate.value - f.elements.cost.value)
});

function monthRep() {
  const t = document.createElement('div');
  t.innerHTML = V.rep();
  const m = t.querySelector('#rm').innerHTML.replace('onchange="rm=this.value;render()"', 'onchange="rm=this.value;monthRep()"').replace('<p><input type="month"', '<p class="no"><input type="month"');
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card" style="max-width:920px"><div class="top no"><h2>Monthly report</h2><div class="acts"><button class="btn ac" onclick="askPrint(1)">🖨 Print</button><button class="btn ghost" onclick="$('#modal').innerHTML=''">Close</button></div></div>${m}<br>${t.lastElementChild.outerHTML}</div></div>`;
  lab($('#modal'))
}

function askPrint(k) {
  ask(k ? `Print the monthly report for ${rm}?` : `Print the daily report for ${rd}?`,
    () => {
      const s = document.querySelector(k ? '#modal .ph' : '#rd .ph');
      if (s) s.textContent = '— ' + (k ? rm : rd);
      document.body.className = k ? 'pi' : 'pr rp-d';
      print()
    }, 'Print')
}
const ftag = id => {
  const c = id == 'f2' ? '#2467b5' : '#1f8a5b';
  return `<span class="tag" style="background:${c}22;color:${c}">${F(id).name}</span>`
};
V.purch = () => hd('Purchases', 'Record every tanker — Petrol and Diesel can come on one invoice') + `<div class="card"><form data-f="purch">${fld('Supplier',`<select name="supplier">${
  opts(S.suppliers)
}
</select>`)}${fld('Date',inp('date','date',td,'required'))}${fld('Invoice number (auto if empty)',inp('inv'))}<div class="pls" style="grid-column:1/-1"><div class="pl ph2"><b>Category</b><span>Litres</span><span>Rate (Rs/L)</span><span style="text-align:right">Amount</span></div>${S.fuels.map(f=>`<div class="pl"><b>${
  ftag(f.id)
}
<input type="hidden" name="fuel" value="${f.id}"></b><input name="qty" type="number" step="any" min="0" placeholder="Litres"><input name="rate" type="number" step="any" min="0" value="${f.cost}"><div class="amt">Rs. 0</div></div>`).join('')}</div>${fld('Paid now (Rs)',inp('paid','number','0','min=0 step=any'))}${fld('Invoice total','<div class="tot" id="ptot">Rs. 0</div>')}<button class="btn ac">Save purchase</button></form></div><div class="card">${tbl(['Date','Supplier','Invoice','Category','>Litres','>Rate','>Total','>Actions'],[...S.purchases].reverse().sort((a,b)=>b.date.localeCompare(a.date)).map(p=>`<tr><td>${
  p.date
}
</td><td>${
  Su(p.supplier)?.name||'-'
}
</td><td>${
  p.inv||''
}
</td><td>${
  ftag(p.fuel)
}
</td><td class="r">${
  fmt(p.qty)
}
 L</td><td class="r">${
  p.rate
}
</td><td class="r">${
  Rs(p.qty*p.rate)
}
</td>${
  X('purchases',
  p.id)
}
</tr>`))}</div>`;
document.addEventListener('input', e => {
  const f = e.target.form;
  if (!f || f.dataset.f != 'purch') return;
  let t = 0;
  f.querySelectorAll('.pl:not(.ph2)').forEach(r => {
    const a = (+r.querySelector('[name=qty]').value || 0) * (+r.querySelector('[name=rate]').value || 0);
    r.querySelector('.amt').textContent = Rs(a);
    t += a
  });
  f.querySelector('#ptot').textContent = Rs(t)
});
H.purch = d => {
  if (fut(d)) return;
  const fu = d._fd.getAll('fuel'),
    q = d._fd.getAll('qty'),
    r = d._fd.getAll('rate');
  let t = 0,
    n = 0;
  const inv = d.inv || ('PUR-' + String((S.pn = (S.pn || 0) + 1)).padStart(4, '0'));
  fu.forEach((f, i) => {
    if (+q[i] > 0) {
      S.purchases.push({
        id: uid(),
        date: d.date,
        fuel: f,
        qty: +q[i],
        rate: +r[i],
        supplier: d.supplier,
        inv
      });
      t += q[i] * r[i];
      n++
    }
  });
  if (!n) {
    alert('Enter litres for at least one fuel.');
    return
  }
  if (+d.paid > 0 && d.supplier) S.spay.push({
    id: uid(),
    supplier: d.supplier,
    amount: Math.min(+d.paid, t),
    method: 'Cash',
    date: d.date,
    notes: 'Paid with ' + inv
  });
  return 'Purchase ' + inv + ' saved'
};
const gen = (f, ok) => d => {
  const n = S.sales.length,
    m = f(d);
  if (m && ok(d) && S.sales.length > n) {
    const id = S.sales[S.sales.length - 1].id;
    setTimeout(() => openInv(id), 0)
  }
  return m
};
H.credit = gen(H.credit,
  () => 1);
H.sale = gen(H.sale, d => d.pay == 'Credit');
const _cp = H.cpay;
H.cpay = d => {
  const m = _cp(d);
  if (d.prof) setTimeout(() => prof(d.cust), 0);
  return m
};
H.custedit = d => {
  if (!d.name.trim()) {
    alert('Name is required.');
    return
  }
  Object.assign(C(d.id), {
    name: d.name.trim(),
    phone: d.phone,
    address: d.address,
    limit: +d.limit || 0,
    open: +d.open || 0
  });
  setTimeout(() => prof(d.id), 0);
  return 'Profile updated'
};

function editCust(id) {
  const c = C(id);
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card" style="max-width:480px"><div class="fhead"><i>✎</i><div><h2>Edit profile</h2><div>${c.name}</div></div></div><form data-f="custedit" style="grid-template-columns:1fr 1fr"><input type="hidden" name="id" value="${id}">${fld('Name',inp('name','text',c.name,'required'))}${fld('Phone',inp('phone','text',c.phone||''))}${fld('Address',inp('address','text',c.address||''))}${fld('Credit limit (Rs, 0 = none)',inp('limit','number',c.limit||0,'min=0'))}${fld('Opening balance (Rs)',inp('open','number',c.open,'step=any'))}<div></div><div class="acts" style="grid-column:1/-1;justify-content:flex-end"><button type="button" class="btn ghost" onclick="prof('${id}')">Cancel</button><button class="btn ac">Save changes</button></div></form></div></div>`
}

function delCust(id) {
  const c = C(id),
    b = cbal(c);
  if (b > 0) {
    alert(`${c.name} still owes ${Rs(b)}. Receive the payment before deleting this profile.`);
    return
  }
  ask(`Delete ${c.name}'s profile? Past sales stay in your records as walk-in sales.`,
    () => {
      S.sales.forEach(s => {
        if (s.cust == id) {
          s.cust = '';
          s.pay = 'Cash'
        }
      });
      S.cpay = S.cpay.filter(x => x.cust != id);
      S.customers = S.customers.filter(x => x.id != id);
      commit('Profile deleted')
    })
}
prof = function(id) {
  const c = C(id);
  if (!c) return;
  const cr = sum(S.sales.filter(x => x.cust == id && x.pay == 'Credit'), s => s.qty * s.rate) + c.open,
    pd = sum(S.cpay.filter(x => x.cust == id), 'amount'),
    bal = cr - pd,
    lim = c.limit || 0,
    u = lim ? Math.min(100, Math.max(0, bal / lim * 100)) : 0;
  const tx = [...S.sales.filter(x => x.cust == id).map(s => ({
    d: s.date,
    t: F(s.fuel).name + ' ' + fmt(s.qty) + ' L' + (s.no ? ' · ' + s.no : ''),
    a: s.qty * s.rate,
    st: s.pay
  })), ...S.cpay.filter(x => x.cust == id).map(p => ({
    d: p.date,
    t: 'Payment (' + p.method + ')',
    a: -p.amount,
    st: 'Received'
  }))].reverse().sort((a, b) => b.d.localeCompare(a.d));
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card pf"><div class="phd"><div class="av">${c.name[0].toUpperCase()}</div><div><h2>${c.name}</h2><div>📞 ${c.phone||'—'} &nbsp;·&nbsp; 📍 ${c.address||'—'}</div></div><button class="btn ghost cl" onclick="$('#modal').innerHTML=''">Close</button></div>
<div class="acts" style="margin-bottom:14px"><button class="btn ac" onclick="openForm('credit','${id}')">+ Give credit</button><button class="btn" onclick="editCust('${id}')">✎ Edit profile</button><button class="btn ghost" style="color:var(--rd);border-color:var(--rd)" onclick="delCust('${id}')">🗑 Delete profile</button></div>
<div class="sgrid">${stat('a','Credit taken',Rs(cr))}${stat('b','Paid',Rs(pd))}${stat('d','Outstanding',Rs(bal))}${stat('c','Credit limit',lim?Rs(lim):'None')}</div>
${lim?`<div class="sub">Used ${
    Math.round(u)
  }
  % · available ${
    Rs(Math.max(0,
    lim-bal))
  }
  </div><div class="bar ${u>=90?'low':''}"><i style="width:${u}%"></i></div>`:''}
<h3>Receive payment</h3><form data-f="cpay"><input type="hidden" name="cust" value="${id}"><input type="hidden" name="prof" value="1">${fld('Amount received',inp('amount','number','','required min=1'))}${fld('Method',`<select name="method"><option>Cash</option><option>Bank</option><option>Easypaisa/JazzCash</option></select>`)}${fld('Date',inp('date','date',td))}<button class="btn ac">Receive payment</button></form>
<h3>Credit invoices</h3>${invTbl(S.sales.filter(x=>x.cust==id&&x.pay=='Credit'))}<h3>History</h3>${tbl(['Date','Details','>Amount','Status'],tx.map(t=>`<tr><td>${
    t.d
  }
  </td><td>${
    t.t
  }
  </td><td class="r">${
    Rs(Math.abs(t.a))
  }
  </td><td><span class="tag ${t.a<0||t.st=='Cash'?'g':'o'}">${
    t.st
  }
  </span></td></tr>`),'No transactions yet.')}</div></div>`;
  lab($('#modal'))
};
const M5 = [
  ['dash', 'Dashboard'],
  ['sales', 'Sales'],
  ['purch', 'Purchases'],
  ['cust', 'Customers'],
  ['pay', 'Payments']
];

function openMore() {
  dlg(`<div class="top" style="margin-bottom:10px"><h3>All features</h3><button class="btn ghost" onclick="dlg()">Close</button></div><div class="ml">${NAV.map(n=>`<button class="${n[0]==cur?'on':''}" onclick="dlg();go('${n[0]}')"><span>${
    n[1]
  }
  </span>${
    n[2]
  }
  <b>›</b></button>`).join('')}</div>`)
}

function post2() {
  const m = $('#main'),
    top = m.querySelector('.top');
  m.querySelectorAll('.card>table').forEach(t => {
    if (t.rows.length > 6) {
      const i = document.createElement('input');
      i.className = 'ts';
      i.placeholder = '🔍 Search this table…';
      i.oninput = () => {
        const q = i.value.toLowerCase();
        [...t.rows].slice(1).forEach(r => r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none')
      };
      t.before(i)
    }
  });
  m.insertAdjacentHTML('afterbegin', `<nav id="tnav">${M5.map(a=>`<button class="${a[0]==cur?'on':''}" onclick="go('${a[0]}')"><span>${
    NAV.find(n=>n[0]==a[0])[1]
  }
  </span>${
    a[1]
  }
  </button>`).join('')}<button class="${M5.some(a=>a[0]==cur)?'':'on'}" onclick="openMore()"><span>☰</span>More</button></nav>`)
}
const _po = post;
post = function() {
  _po();
  post2()
};
let cv = '7';
const setCv = v => {
  cv = v;
  render()
};
const kf = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : n ? String(Math.round(n)) : '';

function chartCard() {
  const tot = f => sum(S.sales.filter(s => f(s.date)), s => s.qty * s.rate),
    now = new Date();
  let d = [],
    sub;
  if (cv == '7') {
    sub = 'Rupees per day';
    d = [6,
      5,
      4,
      3,
      2,
      1,
      0
    ].map(n => {
      const x = dd(n);
      return [x.slice(5),
        tot(y => y == x)
      ]
    })
  } else if (cv == 'm') {
    sub = 'Rupees per month, last 12 months';
    for (let i = 11; i >= 0; i--) {
      const t = new Date(now.getFullYear(), now.getMonth() - i, 1),
        k = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0');
      d.push([t.toLocaleString('en', {
          month: 'short'
        }),
        tot(y => y.slice(0, 7) == k)
      ])
    }
  } else {
    sub = 'Rupees per year';
    const y0 = Math.min(now.getFullYear() - 2, ...S.sales.map(s => +s.date.slice(0, 4)));
    for (let y = y0; y <= now.getFullYear(); y++) d.push([String(y),
      tot(x => x.slice(0, 4) == String(y))
    ])
  }
  const mx = Math.max(...d.map(x => x[1]), 1),
    T = d.reduce((a, x) => a + x[1], 0);
  return `<div class="card"><div class="chart-head"><h3>Sales</h3><div class="seg">${[['7','7 Days'],['m','Monthly'],['y','Yearly']].map(a=>`<button class="${cv==a[0]?'on':''}" onclick="setCv('${a[0]}')">${
    a[1]
  }
  </button>`).join('')}</div></div><p class="sub">${sub} · Total ${Rs(T)}</p><div class="chart ${d.length>8?'dense':''}">${d.map((x,i)=>`<div><span>${
    kf(x[1])
  }
  </span><i class="${i==d.length-1?'cur':''}" style="height:${x[1]/mx*80}%"></i>${
    x[0]
  }
  </div>`).join('')}</div></div>`
}
const _d2 = V.dash;
V.dash = () => {
  const s = _d2(),
    a = s.indexOf('<div class="card"><h3>Sales, last 7 days'),
    b = s.indexOf('<div class="card"><h3>Current stock');
  return a < 0 || b < 0 ? s : s.slice(0, a) + chartCard() + s.slice(b)
};
const sT = s => sum(S.purchases.filter(x => x.supplier == s.id), p => p.qty * p.rate),
  sP = s => sum(S.spay.filter(x => x.supplier == s.id), 'amount');
const newest = a => [...a].reverse().sort((x, y) => y.date.localeCompare(x.date));
V.sup = () => hd('Suppliers', 'How much you owe each supplier') + `<div class="card"><form data-f="sup">${fld('Supplier name',inp('name','text','','required'))}${fld('Contact',inp('phone'))}${fld('Address',inp('address'))}<button class="btn ac">Add supplier</button></form></div><div class="card">${tbl(['Supplier','Contact','>Total purchases','>Paid','>Payable','>Actions'],S.suppliers.map(s=>{const t=sT(s),p=sP(s);return`<tr><td><b>${
  s.name
}
</b></td><td>${
  s.phone||''
}
</td><td class="r">${
  Rs(t)
}
</td><td class="r">${
  Rs(p)
}
</td><td class="r"><span class="tag ${t-p>0?'o':'g'}">${
  Rs(t-p)
}
</span></td><td class="r"><button class="btn ghost" onclick="sprof('${s.id}')">Profile</button></td></tr>`}),'No suppliers yet. Add one above.')}</div>`;
const _su = H.sup;
H.sup = d => {
  const m = _su(d);
  S.suppliers[S.suppliers.length - 1].address = d.address || '';
  return m
};
const _sp = H.spay;
H.spay = d => {
  const m = _sp(d);
  if (d.sprof) setTimeout(() => sprof(d.supplier), 0);
  return m
};
H.supedit = d => {
  if (!d.name.trim()) {
    alert('Name is required.');
    return
  }
  Object.assign(Su(d.id), {
    name: d.name.trim(),
    phone: d.phone,
    address: d.address
  });
  setTimeout(() => sprof(d.id), 0);
  return 'Supplier updated'
};

function editSup(id) {
  const s = Su(id);
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card" style="max-width:480px"><div class="fhead"><i>✎</i><div><h2>Edit supplier</h2><div>${s.name}</div></div></div><form data-f="supedit" style="grid-template-columns:1fr 1fr"><input type="hidden" name="id" value="${id}">${fld('Name',inp('name','text',s.name,'required'))}${fld('Contact',inp('phone','text',s.phone||''))}<div style="grid-column:1/-1">${fld('Address',inp('address','text',s.address||''))}</div><div class="acts" style="grid-column:1/-1;justify-content:flex-end"><button type="button" class="btn ghost" onclick="sprof('${id}')">Cancel</button><button class="btn ac">Save changes</button></div></form></div></div>`
}

function delSup(id) {
  const s = Su(id),
    b = sT(s) - sP(s);
  if (b > 0) {
    alert(`You still owe ${Rs(b)} to ${s.name}. Pay the supplier before deleting this profile.`);
    return
  }
  ask(`Delete ${s.name}'s profile? Past purchases stay in your stock records.`,
    () => {
      S.purchases.forEach(x => {
        if (x.supplier == id) x.supplier = ''
      });
      S.spay = S.spay.filter(x => x.supplier != id);
      S.suppliers = S.suppliers.filter(x => x.id != id);
      commit('Supplier deleted')
    })
}

function sprof(id) {
  const s = Su(id);
  if (!s) return;
  const t = sT(s),
    p = sP(s);
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card pf"><div class="phd"><div class="av">${s.name[0].toUpperCase()}</div><div><h2>${s.name}</h2><div>📞 ${s.phone||'—'} &nbsp;·&nbsp; 📍 ${s.address||'—'}</div></div><button class="btn ghost cl" onclick="$('#modal').innerHTML=''">Close</button></div>
<div class="acts" style="margin-bottom:14px"><button class="btn" onclick="editSup('${id}')">✎ Edit profile</button><button class="btn ghost" style="color:var(--rd);border-color:var(--rd)" onclick="delSup('${id}')">🗑 Delete profile</button></div>
<div class="sgrid">${stat('a','Total purchases',Rs(t))}${stat('b','Paid',Rs(p))}${stat('d','Payable',Rs(t-p))}</div>
<h3>Pay supplier</h3><form data-f="spay"><input type="hidden" name="supplier" value="${id}"><input type="hidden" name="sprof" value="1">${fld('Amount (Rs)',inp('amount','number','','required min=1'))}${fld('Method',`<select name="method"><option>Bank</option><option>Cash</option></select>`)}${fld('Date',inp('date','date',td))}<button class="btn ac">Save payment</button></form>
<h3>Purchases</h3>${tbl(['Date','Invoice','Category','>Litres','>Total'],newest(S.purchases.filter(x=>x.supplier==id)).map(x=>`<tr><td>${
    x.date
  }
  </td><td>${
    x.inv||''
  }
  </td><td>${
    ftag(x.fuel)
  }
  </td><td class="r">${
    fmt(x.qty)
  }
   L</td><td class="r">${
    Rs(x.qty*x.rate)
  }
  </td></tr>`),'No purchases yet.')}
<h3>Payments made</h3>${tbl(['Date','Method','>Amount'],newest(S.spay.filter(x=>x.supplier==id)).map(x=>`<tr><td>${
    x.date
  }
  </td><td>${
    x.method
  }
  </td><td class="r">${
    Rs(x.amount)
  }
  </td></tr>`),'No payments yet.')}</div></div>`;
  lab($('#modal'))
}
const _of = openForm;
openForm = function(k, pre) {
  if (!FORMS[k] && k == 'credit') {
    const t = document.createElement('div');
    t.innerHTML = V.cust();
    FORMS.credit = t.querySelector('form[data-f=credit]').outerHTML
  }
  _of(k, pre)
};
let df = 'all',
  dlim = 7;
const setDf = v => {
  df = v;
  dlim = 7;
  render()
};

function recentCard() {
  const E = [...S.sales.map(s => ({
    k: 'sale',
    id: s.id,
    date: s.date,
    cat: 'sales',
    ty: 'Sale',
    tg: 'g',
    who: C(s.cust)?.name || 'Walk-in',
    det: `${F(s.fuel).name} · ${fmt(s.qty)} L @ ${s.rate} <span class="tag ${s.pay=='Cash'?'g':'o'}">${s.pay}</span>`,
    a: s.qty * s.rate,
    i: 1
  })), ...S.purchases.map(p => ({
    k: 'purch',
    id: p.id,
    date: p.date,
    cat: 'purch',
    ty: 'Purchase',
    tg: 'y',
    who: Su(p.supplier)?.name || '-',
    det: `${F(p.fuel).name} · ${fmt(p.qty)} L @ ${p.rate}`,
    a: p.qty * p.rate,
    i: 0
  })), ...S.cpay.map(p => ({
    k: 'cpay',
    id: p.id,
    date: p.date,
    cat: 'pay',
    ty: 'Payment in',
    tg: 'g',
    who: C(p.cust)?.name || '-',
    det: p.method,
    a: p.amount,
    i: 1
  })), ...S.spay.map(p => ({
    k: 'spay',
    id: p.id,
    date: p.date,
    cat: 'pay',
    ty: 'Payment out',
    tg: 'o',
    who: Su(p.supplier)?.name || '-',
    det: p.method,
    a: p.amount,
    i: 0
  })), ...S.expenses.map(e => ({
    k: 'exp',
    id: e.id,
    date: e.date,
    cat: 'exp',
    ty: 'Expense',
    tg: 'o',
    who: e.cat,
    det: e.desc || '',
    a: e.amount,
    i: 0
  }))];
  const L = newest(E).filter(e => df == 'all' || e.cat == df),
    rows = L.slice(0, dlim).map(e => `<tr class="clk" onclick="openTx('${e.k}','${e.id}')"><td>${e.date}</td><td><span class="tag ${e.tg}">${e.ty}</span></td><td><b>${e.who}</b></td><td>${e.det}</td><td class="r"><b style="color:var(--${e.i?'gr':'rd'})">${e.i?'+':'−'} ${Rs(e.a)}</b></td></tr>`);
  return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px"><h3>Recent transactions</h3><select style="width:auto" onchange="setDf(this.value)">${[['all','All transactions'],['sales','Sales'],['purch','Purchases'],['pay','Payments'],['exp','Expenses']].map(a=>`<option value="${a[0]}" ${
    df==a[0]?'selected':''
  }
  >${
    a[1]
  }
  </option>`).join('')}</select></div>${tbl(['Date','Type','Name','Details','>Amount'],rows,'No transactions here yet.')}${L.length>7?`<p style="text-align:center;margin:12px 0 0"><button class="btn ghost" onclick="dlim=${dlim<L.length?dlim+10:7};render()">${
    dlim<L.length?'Show more':'Show less'
  }
  </button></p>`:''}</div>`
}
const _d3 = V.dash;
V.dash = () => {
  const s = _d3(),
    a = s.indexOf('<div class="card"><h3>Recent transactions');
  return a < 0 ? s : s.slice(0, a) + recentCard()
};

function rcpt(t, no, date, who, head, rows, total, pb) {
  $('#modal').innerHTML = `<div class="modal" onclick="if(event.target==this)this.remove()"><div class="card"><div class="top no"><h2>${t}</h2><div class="acts">${pb?`<button class="btn ac" onclick="${pb}">👤 Profile</button>`:''}<button class="btn" onclick="document.body.className='pi';print()">Print</button><button class="btn ghost" onclick="$('#modal').innerHTML=''">Close</button></div></div><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px"><div><h2>Petrol Station</h2><div class="sub">${t}</div></div><div style="text-align:right"><b>${no||''}</b><div class="sub">Date: ${date}</div></div></div><hr style="border:0;border-top:1px solid var(--ln)"><p><b>${who[0]}:</b> ${who[1]}</p>${tbl(head,rows)}<br><div class="sgrid">${stat('a','Total',Rs(total))}</div></div></div>`;
  lab($('#modal'))
}

function openTx(k, id) {
  if (k == 'sale') {
    const s = S.sales.find(x => x.id == id),
      c = C(s.cust);
    if (s.pay == 'Credit' && c) {
      openInv(id);
      return
    }
    rcpt('Sale receipt', s.no || '', s.date,
      ['Customer',
        c ? c.name : 'Walk-in'
      ],
      ['Fuel', '>Litres', '>Rate', '>Payment'],
      [`<tr><td>${F(s.fuel).name}</td><td class="r">${fmt(s.qty)}</td><td class="r">${s.rate}</td><td class="r">${s.pay}</td></tr>`], s.qty * s.rate, c ? `prof('${c.id}')` : '');
    return
  }
  if (k == 'purch') {
    const p = S.purchases.find(x => x.id == id),
      L = p.inv ? S.purchases.filter(x => x.inv == p.inv && x.supplier == p.supplier && x.date == p.date) : [p],
      s = Su(p.supplier);
    rcpt('Purchase invoice', p.inv, p.date,
      ['Supplier',
        s ? s.name : '-'
      ],
      ['Category', '>Litres', '>Rate', '>Amount'], L.map(x => `<tr><td>${ftag(x.fuel)}</td><td class="r">${fmt(x.qty)}</td><td class="r">${x.rate}</td><td class="r">${Rs(x.qty*x.rate)}</td></tr>`), sum(L, x => x.qty * x.rate), s ? `sprof('${s.id}')` : '');
    return
  }
  if (k == 'cpay') {
    const p = S.cpay.find(x => x.id == id),
      c = C(p.cust);
    rcpt('Payment received', '', p.date,
      ['Customer',
        c ? c.name : '-'
      ],
      ['Method', 'Notes'],
      [`<tr><td>${p.method}</td><td>${p.notes||''}</td></tr>`], p.amount, c ? `prof('${c.id}')` : '');
    return
  }
  if (k == 'spay') {
    const p = S.spay.find(x => x.id == id),
      s = Su(p.supplier);
    rcpt('Payment made', '', p.date,
      ['Supplier',
        s ? s.name : '-'
      ],
      ['Method', 'Notes'],
      [`<tr><td>${p.method}</td><td>${p.notes||''}</td></tr>`], p.amount, s ? `sprof('${s.id}')` : '');
    return
  }
  const e = S.expenses.find(x => x.id == id);
  rcpt('Expense', '', e.date,
    ['Category',
      e.cat
    ],
    ['Description'],
    [`<tr><td>${e.desc||'—'}</td></tr>`], e.amount, '')
}
const _d4 = V.dash;
V.dash = () => {
  const s = _d4(),
    low = S.fuels.filter(f => stock(f) < f.min);
  if (!low.length) return s;
  const i = s.indexOf('<div class="sgrid">');
  return s.slice(0, i) + `<div class="alert" onclick="go('stock')"><span style="font-size:22px">⚠️</span><div>Low stock alert: ${low.map(f=>`<b>${
    f.name
  }
  </b> ${
    fmt(stock(f))
  }
   L left (minimum ${
    fmt(f.min)
  }
   L)`).join(' · ')}. Order a tanker soon.</div></div>` + s.slice(i)
};
V.set = () => hd('Settings', 'Backup, restore and start fresh') + `<div class="card"><h3>Start with your real data</h3><p class="sub">Removes the sample sales, customers and purchases. Fuels stay, so you can set your own opening stock and rates in Fuel & Stock.</p><button class="btn ac" onclick="wipe()">Clear sample data</button></div><div class="card"><h3>Backup & restore</h3><p class="sub">Copy this text and keep it safe. Paste it back here to restore.</p><textarea id="bk" style="width:100%;height:120px;font:12px monospace;background:var(--bg);color:var(--ink);border:1px solid var(--ln);border-radius:8px">${JSON.stringify(S).replace(/</g,'&lt;')}</textarea><p class="acts"><button class="btn" onclick="navigator.clipboard&&navigator.clipboard.writeText($('#bk').value);toast('Copied')">Copy backup</button><button class="btn ghost" onclick="restore()">Restore from text</button></p></div>`;

function wipe() {
  ask('Delete all sample data?',
    () => {
      S = {
        fuels: S.fuels.map(f => ({
          ...f,
          open: 0
        })),
        suppliers: [],
        customers: [],
        purchases: [],
        sales: [],
        cpay: [],
        spay: [],
        expenses: []
      };
      commit('Data cleared')
    })
}

function restore() {
  try {
    const d = JSON.parse($('#bk').value);
    if (!d.fuels) throw 0;
    S = d;
    commit('Restored')
  } catch (e) {
    alert('Backup text is not valid.')
  }
}
render();
