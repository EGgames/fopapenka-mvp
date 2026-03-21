const { expect } = require('chai');
const sinon = require('sinon');
const { updateMatch, deleteMatch } = require('../src/controllers/match.controller');
const { Match, Prediction, Score } = require('../src/models');

describe('Match Controller - FUNC-027: Edit & Delete Matches', () => {

  afterEach(() => {
    sinon.restore();
  });

  /* ─── UPDATE MATCH ──────────────────────────────────────── */
  describe('PUT /api/matches/:id (updateMatch)', () => {

    it('debería actualizar equipos de un partido programado', async () => {
      const req = { params: { id: 1 }, body: { home_team_id: 3, away_team_id: 4 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      const mockMatch = {
        id: 1, home_team_id: 1, away_team_id: 2, status: 'scheduled', match_date: null,
        save: sinon.stub().resolves(),
      };

      const updatedMatch = { id: 1, home_team_id: 3, away_team_id: 4, homeTeam: { id: 3, name: 'Team C' }, awayTeam: { id: 4, name: 'Team D' } };

      sinon.stub(Match, 'findByPk')
        .onFirstCall().resolves(mockMatch)
        .onSecondCall().resolves(updatedMatch);
      sinon.stub(Prediction, 'findAll').resolves([{ id: 10 }, { id: 11 }]);
      sinon.stub(Score, 'destroy').resolves();
      sinon.stub(Prediction, 'destroy').resolves();

      await updateMatch(req, res);

      expect(res.json.calledOnce).to.be.true;
      const result = res.json.firstCall.args[0];
      expect(result.match.home_team_id).to.equal(3);
      expect(result.predictions_deleted).to.be.true;
    });

    it('debería actualizar solo la fecha sin borrar pronósticos', async () => {
      const req = { params: { id: 1 }, body: { match_date: '2026-03-15T18:00:00.000Z' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      const mockMatch = {
        id: 1, home_team_id: 1, away_team_id: 2, status: 'scheduled', match_date: null,
        save: sinon.stub().resolves(),
      };
      const updatedMatch = { id: 1, home_team_id: 1, away_team_id: 2, match_date: '2026-03-15T18:00:00.000Z' };

      sinon.stub(Match, 'findByPk')
        .onFirstCall().resolves(mockMatch)
        .onSecondCall().resolves(updatedMatch);

      await updateMatch(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0].predictions_deleted).to.be.false;
      // Prediction.findAll no fue llamado porque los equipos no cambiaron
    });

    it('debería rechazar la edición de un partido ya jugado', async () => {
      const req = { params: { id: 1 }, body: { home_team_id: 3 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves({
        id: 1, status: 'played', home_team_id: 1, away_team_id: 2,
      });

      await updateMatch(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('ya jugado');
    });

    it('debería rechazar si local y visitante son el mismo equipo', async () => {
      const req = { params: { id: 1 }, body: { home_team_id: 5, away_team_id: 5 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves({
        id: 1, status: 'scheduled', home_team_id: 1, away_team_id: 2,
      });

      await updateMatch(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('mismo');
    });

    it('debería devolver 404 si el partido no existe', async () => {
      const req = { params: { id: 999 }, body: { home_team_id: 1 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves(null);

      await updateMatch(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  /* ─── DELETE MATCH ──────────────────────────────────────── */
  describe('DELETE /api/matches/:id (deleteMatch)', () => {

    it('debería eliminar un partido programado y sus pronósticos', async () => {
      const req = { params: { id: 1 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      const mockMatch = {
        id: 1, status: 'scheduled',
        destroy: sinon.stub().resolves(),
      };

      sinon.stub(Match, 'findByPk').resolves(mockMatch);
      sinon.stub(Prediction, 'findAll').resolves([{ id: 10 }, { id: 11 }]);
      sinon.stub(Score, 'destroy').resolves();
      sinon.stub(Prediction, 'destroy').resolves();

      await deleteMatch(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0].message).to.include('eliminado');
      expect(Score.destroy.calledOnce).to.be.true;
      expect(Prediction.destroy.calledOnce).to.be.true;
      expect(mockMatch.destroy.calledOnce).to.be.true;
    });

    it('debería eliminar un partido sin pronósticos asociados', async () => {
      const req = { params: { id: 1 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      const mockMatch = {
        id: 1, status: 'scheduled',
        destroy: sinon.stub().resolves(),
      };

      sinon.stub(Match, 'findByPk').resolves(mockMatch);
      sinon.stub(Prediction, 'findAll').resolves([]);

      await deleteMatch(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(mockMatch.destroy.calledOnce).to.be.true;
    });

    it('debería rechazar la eliminación de un partido ya jugado', async () => {
      const req = { params: { id: 1 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves({
        id: 1, status: 'played',
      });

      await deleteMatch(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].error).to.include('ya jugado');
    });

    it('debería devolver 404 si el partido no existe', async () => {
      const req = { params: { id: 999 } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      sinon.stub(Match, 'findByPk').resolves(null);

      await deleteMatch(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });
});
