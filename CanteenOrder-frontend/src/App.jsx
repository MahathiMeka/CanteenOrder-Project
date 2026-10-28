import React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Change this if your Spring Boot controller uses a different base URL/path.
const API_BASE_URL = 'http://localhost:9081/canteen';

const emptyForm = {
  orderCode: '',
  itemCount: '1',
  totalCost: '',
  pickupStatus: 'PENDING',
};

function normalizeOrder(item) {
  return {
    id: item.id,
    orderCode: item.ordercode ?? '',
    itemCount: item.itemcount ?? 0,
    totalCost: item.totalcost ?? 0,
    pickupStatus: item.pickupstatus ?? ''
  };
}

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
    : '—';
}

function statusClass(status) {
  const value = String(status || '').toLowerCase();
  if (value.includes('ready') || value.includes('complete') || value.includes('picked')) return 'status-success';
  if (value.includes('cancel')) return 'status-danger';
  return 'status-pending';
}

export default function App() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const showNotice = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4500);
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await fetch(`${API_BASE_URL}/displayall`);
      if (!response.ok) throw new Error(`Could not load orders (HTTP ${response.status}).`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('The API response was not a list. Check your GET endpoint response.');
      setOrders(data.map(normalizeOrder));
    } catch (error) {
      setPageError(`${error.message || 'Unable to connect to the backend.'} Check that Spring Boot is running and API_BASE_URL matches your controller.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter(order => {
      const matchesSearch =
        String(order.id ?? '').toLowerCase().includes(query) ||
        order.orderCode.toLowerCase().includes(query) ||
        order.pickupStatus.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'ALL' || order.pickupStatus.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const validate = () => {
    const next = {};
    const code = form.orderCode.trim();
    const count = Number(form.itemCount);
    const cost = Number(form.totalCost);

    if (!code) next.orderCode = 'Enter an order code.';
    else if (code.length > 50) next.orderCode = 'Order code must be 50 characters or fewer.';
    if (form.itemCount === '' || !Number.isInteger(count)) next.itemCount = 'Enter a whole number of items.';
    else if (count <= 0) next.itemCount = 'Item count must be greater than zero.';
    if (form.totalCost === '' || !Number.isFinite(cost)) next.totalCost = 'Enter a valid total cost.';
    else if (cost < 0) next.totalCost = 'Total cost cannot be negative.';
    if (!form.pickupStatus.trim()) next.pickupStatus = 'Choose a pickup status.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordercode: form.orderCode.trim(),
          itemcount: Number(form.itemCount),
          totalcost: Number(form.totalCost),
          pickupstatus: form.pickupStatus
        }),
      });
      if (!response.ok) {
        let message = `Could not add order (HTTP ${response.status}).`;
        try {
          const body = await response.json();
          if (body.message) message = body.message;
          else if (body.errors) message = Object.values(body.errors).join(' ');
        } catch { /* response may not contain JSON */ }
        throw new Error(message);
      }
      setForm(emptyForm);
      setErrors({});
      showNotice('success', 'Order added successfully.');
      await loadOrders();
    } catch (error) {
      showNotice('danger', `${error.message || 'Unable to save order.'} Check the API URL and backend validation.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteOrder = async (order) => {
    if (!window.confirm(`Delete order ${order.orderCode || `#${order.id}`}? This action cannot be undone.`)) return;
    setDeletingId(order.id);
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${encodeURIComponent(order.id)}`, { method: 'DELETE' });
      if (!response.ok) {
        let message = `Could not delete order (HTTP ${response.status}).`;
        try {
          const body = await response.json();
          if (body.message) message = body.message;
        } catch { /* 204/empty response is okay to ignore */ }
        throw new Error(message);
      }
      setOrders(previous => previous.filter(item => String(item.id) !== String(order.id)));
      showNotice('success', 'Order deleted successfully.');
    } catch (error) {
      showNotice('danger', `${error.message || 'Unable to delete order.'} Confirm the DELETE endpoint.`);
    } finally {
      setDeletingId(null);
    }
  };

  const updatePickupStatus = async (order, pickupStatus) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/update/${encodeURIComponent(order.id)}?pickupStatus=${encodeURIComponent(pickupStatus)}`,
      { method: 'PUT' }
    );

    if (!response.ok) {
      throw new Error(`Could not update status (HTTP ${response.status}).`);
    }

    showNotice('success', 'Pickup status updated successfully.');
    await loadOrders();
  } catch (error) {
    showNotice('danger', error.message || 'Unable to update pickup status.');
  }
};

  const updateField = (field, value) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: '' }));
  };

  const pendingCount = orders.filter(o => !/ready|complete|picked|cancel/i.test(o.pickupStatus)).length;
  const readyCount = orders.filter(o => /ready|complete|picked/i.test(o.pickupStatus)).length;

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg navbar-dark topbar">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#home">
            <span className="brand-mark"><i className="bi bi-cup-hot-fill" /></span>
            <span>Canteen<span className="brand-light">Order</span></span>
          </a>
          <div className="d-flex gap-2">
            <a className="nav-link nav-pill" href="#orders"><i className="bi bi-list-ul me-2" />Orders</a>
            <a className="nav-link nav-pill" href="#add-order"><i className="bi bi-plus-circle me-2" />Add order</a>
          </div>
        </div>
      </nav>

      <main id="home" className="container page-container">
        <section className="hero-panel">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> CANTEEN OPERATIONS</div>
            <h1>Good food.<br /><span>Orders under control.</span></h1>
            <p>Manage canteen orders, track pickup status, and keep service moving smoothly.</p>
            <a href="#add-order" className="btn btn-light hero-button"><i className="bi bi-plus-lg me-2" />Create an order</a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-circle circle-one" />
            <div className="art-circle circle-two" />
            <div className="plate"><i className="bi bi-egg-fried" /></div>
            <div className="art-label"><i className="bi bi-check2-circle me-2" />Freshly organized</div>
          </div>
        </section>

        {notice && (
          <div className={`alert alert-${notice.type} alert-dismissible fade show notice`} role="alert">
            <i className={`bi ${notice.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`} />
            {notice.message}
            <button type="button" className="btn-close" onClick={() => setNotice(null)} aria-label="Close" />
          </div>
        )}

        <section className="stats-grid" aria-label="Order summary">
          <div className="stat-card">
            <div className="stat-icon icon-green"><i className="bi bi-receipt-cutoff" /></div>
            <div><div className="stat-label">Total orders</div><div className="stat-number">{orders.length}</div></div>
            <span className="stat-foot">All records</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-amber"><i className="bi bi-hourglass-split" /></div>
            <div><div className="stat-label">In progress</div><div className="stat-number">{pendingCount}</div></div>
            <span className="stat-foot">Need attention</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-blue"><i className="bi bi-bag-check" /></div>
            <div><div className="stat-label">Ready / completed</div><div className="stat-number">{readyCount}</div></div>
            <span className="stat-foot">Pickup progress</span>
          </div>
        </section>

        <div className="content-grid">
          <section className="panel form-panel" id="add-order">
            <div className="panel-heading">
              <div>
                <div className="section-kicker">NEW RECORD</div>
                <h2>Add a canteen order</h2>
                <p>Fill in the order details below.</p>
              </div>
              <div className="heading-icon"><i className="bi bi-bag-plus" /></div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="orderCode" className="form-label">Order code <span className="required">*</span></label>
                <input id="orderCode" className={`form-control ${errors.orderCode ? 'is-invalid' : ''}`}
                  placeholder="e.g. ORD-1001" maxLength={50} value={form.orderCode}
                  onChange={e => updateField('orderCode', e.target.value)} />
                {errors.orderCode && <div className="invalid-feedback">{errors.orderCode}</div>}
                <div className="form-text">Maximum 50 characters.</div>
              </div>

              <div className="row g-3">
                <div className="col-sm-6 mb-3">
                  <label htmlFor="itemCount" className="form-label">Item count <span className="required">*</span></label>
                  <input id="itemCount" type="number" min="1" step="1"
                    className={`form-control ${errors.itemCount ? 'is-invalid' : ''}`}
                    placeholder="e.g. 2" value={form.itemCount}
                    onChange={e => updateField('itemCount', e.target.value)} />
                  {errors.itemCount && <div className="invalid-feedback">{errors.itemCount}</div>}
                </div>
                <div className="col-sm-6 mb-3">
                  <label htmlFor="totalCost" className="form-label">Total cost (₹) <span className="required">*</span></label>
                  <input id="totalCost" type="number" min="0" step="0.01"
                    className={`form-control ${errors.totalCost ? 'is-invalid' : ''}`}
                    placeholder="e.g. 150.00" value={form.totalCost}
                    onChange={e => updateField('totalCost', e.target.value)} />
                  {errors.totalCost && <div className="invalid-feedback">{errors.totalCost}</div>}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="pickupStatus" className="form-label">Pickup status <span className="required">*</span></label>
                <select id="pickupStatus" className={`form-select ${errors.pickupStatus ? 'is-invalid' : ''}`}
                  value={form.pickupStatus} onChange={e => updateField('pickupStatus', e.target.value)}>
                  <option value="PENDING">Pending</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY">Ready for pickup</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                {errors.pickupStatus && <div className="invalid-feedback">{errors.pickupStatus}</div>}
                <div className="form-text">Choose the current status for this order.</div>
              </div>

              <div className="form-note"><i className="bi bi-shield-check me-2" />Order ID is generated automatically by the backend.</div>
              <button className="btn btn-primary w-100 submit-button" type="submit" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving order...</> : <><i className="bi bi-plus-circle me-2" />Add order</>}
              </button>
            </form>
          </section>

          <section className="panel orders-panel" id="orders">
            <div className="panel-heading orders-heading">
              <div>
                <div className="section-kicker">ORDER MANAGEMENT</div>
                <h2>Recent orders</h2>
                <p>View and manage your canteen order records.</p>
              </div>
              <button className="btn btn-outline-secondary refresh-button" onClick={loadOrders} disabled={loading} title="Refresh orders">
                <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`} /> <span className="d-none d-sm-inline ms-1">Refresh</span>
              </button>
            </div>

            <div className="filters">
              <div className="search-wrap">
                <i className="bi bi-search" />
                <input className="form-control" aria-label="Search orders" placeholder="Search code, ID, status..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-select status-filter" aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {pageError && (
              <div className="connection-error">
                <div className="error-icon"><i className="bi bi-wifi-off" /></div>
                <div>
                  <strong>Can't reach the orders API</strong>
                  <p>{pageError}</p>
                  <button className="btn btn-sm btn-outline-danger" onClick={loadOrders}>Try again</button>
                </div>
              </div>
            )}

            {loading && !pageError ? (
              <div className="loading-state"><span className="spinner-border text-success" /><span>Loading orders...</span></div>
            ) : !pageError && filteredOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><i className="bi bi-inbox" /></div>
                <h3>{orders.length === 0 ? 'No orders yet' : 'No matching orders'}</h3>
                <p>{orders.length === 0 ? 'Your orders will appear here after you add the first one.' : 'Try another search term or change the status filter.'}</p>
                {orders.length === 0 && <a href="#add-order" className="btn btn-outline-success"><i className="bi bi-plus-lg me-2" />Add your first order</a>}
              </div>
            ) : !pageError && (
              <>
                <div className="table-responsive desktop-table">
                  <table className="table align-middle order-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Items</th>
                        <th>Total cost</th>
                        <th>Pickup status</th>
                        <th>Update status</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td><div className="order-id">#{order.id}</div><div className="order-code">{order.orderCode}</div></td>
                          <td>{order.itemCount}</td>
                          <td className="cost-cell">{money(order.totalCost)}</td>
                          <td>
                            <span className={`status-badge ${statusClass(order.pickupStatus)}`}>
                              <span />{order.pickupStatus || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm mb-2"
                              value={order.pickupStatus || 'PENDING'}
                              onChange={(e) => updatePickupStatus(order, e.target.value)}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="PREPARING">Preparing</option>
                              <option value="READY">Ready</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-sm delete-button" onClick={() => deleteOrder(order)} disabled={deletingId === order.id} aria-label={`Delete order ${order.orderCode}`} title="Delete order">
                              {deletingId === order.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-trash3" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mobile-order-list">
                  {filteredOrders.map(order => (
                    <article className="mobile-order-card" key={order.id}>
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div><div className="order-id">Order #{order.id}</div><div className="order-code">{order.orderCode}</div></div>
                        <span className={`status-badge ${statusClass(order.pickupStatus)}`}><span />{order.pickupStatus || 'Unknown'}</span>
                      </div>
                      <div className="mobile-order-details">
                        <span><small>Items</small><strong>{order.itemCount}</strong></span>
                        <span><small>Total cost</small><strong>{money(order.totalCost)}</strong></span>
                      </div>
                      <button className="btn btn-sm btn-outline-danger w-100" onClick={() => deleteOrder(order)} disabled={deletingId === order.id}>
                        <i className="bi bi-trash3 me-2" />Delete order
                      </button>
                    </article>
                  ))}
                </div>
                <div className="table-footer"><span>Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders</span><span><i className="bi bi-cloud-check me-1" />Connected view</span></div>
              </>
            )}
          </section>
        </div>
        <footer className="page-footer"><span>© {new Date().getFullYear()} CanteenOrder Manager</span><span>Simple service. Smooth pickup.</span></footer>
      </main>
    </div>
  );
}