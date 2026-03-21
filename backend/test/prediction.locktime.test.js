const { expect } = require('chai');
const sinon = require('sinon');
const { upsert, update, batchUpsert } = require('../src/controllers/prediction.controller');
const { Prediction, Match } = require('../src/models');

describe('Prediction Controller - Bloqueo por hora de inicio', () => {

  let clock;

  afterEach(() => {
    sinon.restore();
    if (clock) clock.restore();
  });

  describe('upsert - bloqueo por match_date', () => {
    it('debería rechazar pronóstico si el partido ya comenzó', async () => {
      // Fijar hora actual: 2026-03-21 20:30 UTC (23:30 GMT-3)
      clock = sinon.useFakeTimers(new Date('2026-03-21T20:30:00Z'));

      const req = {
        user: { userId: 1, pencaId: 10 },
        body: { match_id: 1, predicted_home: 2, predicted_away: 1 },
      };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      // Partido empezó a las 20:00 UTC (23:00 GMT-3)
      sinon.stub(Match, 'findByPk').resolves({
        id: 1, status: 'scheduled', match_date: '2026-03-21T20:00:00Z',
      });

      await upsert(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('ya comenzó');
    });

    it('debería permitir pronóstico si el partido aún no comienza', async () => {
      // Fijar hora actual: 2026-03-21 19:30 UTC (22:30 GMT-3)
      clock = sinon.useFakeTimers(new Date('2026-03-21T19:30:00Z'));

      const req = {
        user: { userId: 1, pencaId: 10 },
        body: { match_id: 1, predicted_home: 2, predicted_away: 1 },
      };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves({
        id: 1, status: 'scheduled', match_date: '2026-03-21T20:00:00Z',
      });
      sinon.stub(Prediction, 'findOne').resolves(null);
      sinon.stub(Prediction, 'create').resolves({
        id: 1, match_id: 1, predicted_home: 2, predicted_away: 1,
      });

      await upsert(req, res);

      expect(res.status.calledWith(201)).to.be.true;
    });

    it('debería permitir pronóstico si el partido no tiene fecha definida', async () => {
      const req = {
        user: { userId: 1, pencaId: 10 },
        body: { match_id: 1, predicted_home: 0, predicted_away: 0 },
      };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves({
        id: 1, status: 'scheduled', match_date: null,
      });
      sinon.stub(Prediction, 'findOne').resolves(null);
      sinon.stub(Prediction, 'create').resolves({
        id: 1, match_id: 1, predicted_home: 0, predicted_away: 0,
      });

      await upsert(req, res);

      expect(res.status.calledWith(201)).to.be.true;
    });
  });

  describe('update - bloqueo por match_date', () => {
    it('debería rechazar actualización si el partido ya comenzó', async () => {
      clock = sinon.useFakeTimers(new Date('2026-03-21T21:00:00Z'));

      const req = {
        user: { userId: 1, pencaId: 10 },
        params: { matchId: '1' },
        body: { predicted_home: 3, predicted_away: 0 },
      };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves({
        id: 1, status: 'scheduled', match_date: '2026-03-21T20:00:00Z',
      });

      await update(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('ya comenzó');
    });
  });

  describe('batchUpsert - bloqueo por match_date', () => {
    it('debería rechazar batch si algún partido ya comenzó', async () => {
      clock = sinon.useFakeTimers(new Date('2026-03-21T20:30:00Z'));

      const req = {
        user: { userId: 1, pencaId: 10 },
        body: {
          predictions: [
            { match_id: 1, predicted_home: 1, predicted_away: 0 },
            { match_id: 2, predicted_home: 2, predicted_away: 2 },
          ],
        },
      };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findAll').resolves([
        { id: 1, status: 'scheduled', match_date: '2026-03-21T22:00:00Z' }, // aún no empezó
        { id: 2, status: 'scheduled', match_date: '2026-03-21T20:00:00Z' }, // ya comenzó
      ]);

      await batchUpsert(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('ya comenzaron');
      expect(res.json.firstCall.args[0].started_match_ids).to.deep.equal([2]);
    });

    it('debería permitir batch si ningún partido ha comenzado', async () => {
      clock = sinon.useFakeTimers(new Date('2026-03-21T18:00:00Z'));

      const req = {
        user: { userId: 1, pencaId: 10 },
        body: {
          predictions: [
            { match_id: 1, predicted_home: 1, predicted_away: 0 },
          ],
        },
      };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findAll').resolves([
        { id: 1, status: 'scheduled', match_date: '2026-03-21T20:00:00Z' },
      ]);
      sinon.stub(Prediction, 'findAll').resolves([]);
      sinon.stub(Prediction, 'create').resolves({
        id: 1, match_id: 1, predicted_home: 1, predicted_away: 0,
      });

      await batchUpsert(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0].success).to.be.true;
    });
  });
});
