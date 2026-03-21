const { expect } = require('chai');
const sinon = require('sinon');
const { getCalendar } = require('../src/controllers/fixture.controller');
const { Fixture, Match, Team, Tournament } = require('../src/models');

describe('Fixture Controller - FUNC-012: Ver calendario completo', () => {
  
  afterEach(() => {
    sinon.restore();
  });

  describe('GET /api/fixtures/calendar', () => {
    it('debería devolver el calendario completo del torneo activo', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockTournament = {
        id: 100,
        name: 'Apertura 2026',
        penca_id: 10,
        status: 'active',
      };

      const mockFixtures = [
        {
          id: 1,
          name: 'Fecha 1',
          number: 1,
          Matches: [
            {
              id: 1,
              match_datetime: new Date('2026-03-25T18:00:00'),
              status: 'programado',
              home_goals: null,
              away_goals: null,
              homeTeam: { id: 1, name: 'Nacional', logo_url: 'nacional.png' },
              awayTeam: { id: 2, name: 'Peñarol', logo_url: 'penarol.png' },
            },
            {
              id: 2,
              match_datetime: new Date('2026-03-26T20:00:00'),
              status: 'programado',
              home_goals: null,
              away_goals: null,
              homeTeam: { id: 3, name: 'Defensor', logo_url: 'defensor.png' },
              awayTeam: { id: 4, name: 'Wanderers', logo_url: 'wanderers.png' },
            },
          ],
        },
        {
          id: 2,
          name: 'Fecha 2',
          number: 2,
          Matches: [
            {
              id: 3,
              match_datetime: new Date('2026-03-20T18:00:00'), // Partido pasado
              status: 'jugado',
              home_goals: 2,
              away_goals: 1,
              homeTeam: { id: 1, name: 'Nacional', logo_url: 'nacional.png' },
              awayTeam: { id: 3, name: 'Defensor', logo_url: 'defensor.png' },
            },
          ],
        },
      ];

      sinon.stub(Tournament, 'findOne').resolves(mockTournament);
      sinon.stub(Fixture, 'findAll').resolves(mockFixtures);

      await getCalendar(req, res);

      expect(Tournament.findOne.calledOnce).to.be.true;
      expect(Fixture.findAll.calledOnce).to.be.true;
      
      expect(res.json.calledOnce).to.be.true;
      const response = res.json.firstCall.args[0];
      
      expect(response).to.have.property('tournament');
      expect(response.tournament).to.deep.equal({ id: 100, name: 'Apertura 2026' });
      
      expect(response).to.have.property('fixtures');
      expect(response.fixtures).to.be.an('array');
      expect(response.fixtures).to.have.lengthOf(2);
      
      // Verificar estructura de fixture
      const fixture1 = response.fixtures[0];
      expect(fixture1).to.include({ id: 1, name: 'Fecha 1', number: 1 });
      expect(fixture1.matches).to.be.an('array');
      expect(fixture1.matches).to.have.lengthOf(2);
      
      // Verificar match con indicador de tiempo
      const match1 = fixture1.matches[0];
      expect(match1).to.have.property('is_upcoming');
      expect(match1).to.have.property('hours_until_start');
      expect(match1.is_upcoming).to.be.true;
      expect(match1.hours_until_start).to.be.a('number');
    });

    it('debería devolver 404 si no hay torneo activo', async () => {
      const req = {
        user: { userId: 1, pencaId: 99, role: 'player' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      sinon.stub(Tournament, 'findOne').resolves(null);

      await getCalendar(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({ 
        error: 'No hay torneo activo en esta penca' 
      });
    });

    it('debería ordenar fixtures por número y partidos por fecha', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockTournament = { id: 100, name: 'Apertura', penca_id: 10, status: 'active' };
      const mockFixtures = [
        {
          id: 2,
          name: 'Fecha 2',
          number: 2,
          Matches: [
            {
              id: 3,
              match_datetime: new Date('2026-03-30T20:00:00'),
              status: 'programado',
              home_goals: null,
              away_goals: null,
              homeTeam: { id: 5, name: 'Liverpool', logo_url: null },
              awayTeam: { id: 6, name: 'Cerro', logo_url: null },
            },
          ],
        },
        {
          id: 1,
          name: 'Fecha 1',
          number: 1,
          Matches: [
            {
              id: 2,
              match_datetime: new Date('2026-03-28T20:00:00'),
              status: 'programado',
              home_goals: null,
              away_goals: null,
              homeTeam: { id: 3, name: 'Defensor', logo_url: null },
              awayTeam: { id: 4, name: 'Wanderers', logo_url: null },
            },
            {
              id: 1,
              match_datetime: new Date('2026-03-25T18:00:00'),
              status: 'programado',
              home_goals: null,
              away_goals: null,
              homeTeam: { id: 1, name: 'Nacional', logo_url: null },
              awayTeam: { id: 2, name: 'Peñarol', logo_url: null },
            },
          ],
        },
      ];

      sinon.stub(Tournament, 'findOne').resolves(mockTournament);
      sinon.stub(Fixture, 'findAll').resolves(mockFixtures);

      await getCalendar(req, res);

      const response = res.json.firstCall.args[0];
      
      // Verificar que findAll fue llamado con orden correcto
      const fixtureCall = Fixture.findAll.firstCall.args[0];
      expect(fixtureCall.order).to.exist;
    });

    it('debería calcular correctamente is_upcoming y hours_until_start', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const now = new Date();
      const futureMatch = new Date(now.getTime() + 5 * 60 * 60 * 1000); // +5 horas
      const pastMatch = new Date(now.getTime() - 2 * 60 * 60 * 1000); // -2 horas

      const mockTournament = { id: 100, name: 'Apertura', penca_id: 10, status: 'active' };
      const mockFixtures = [
        {
          id: 1,
          name: 'Fecha 1',
          number: 1,
          Matches: [
            {
              id: 1,
              match_datetime: futureMatch,
              status: 'programado',
              home_goals: null,
              away_goals: null,
              homeTeam: { id: 1, name: 'Nacional', logo_url: null },
              awayTeam: { id: 2, name: 'Peñarol', logo_url: null },
            },
            {
              id: 2,
              match_datetime: pastMatch,
              status: 'jugado',
              home_goals: 2,
              away_goals: 1,
              homeTeam: { id: 3, name: 'Defensor', logo_url: null },
              awayTeam: { id: 4, name: 'Wanderers', logo_url: null },
            },
          ],
        },
      ];

      sinon.stub(Tournament, 'findOne').resolves(mockTournament);
      sinon.stub(Fixture, 'findAll').resolves(mockFixtures);

      await getCalendar(req, res);

      const response = res.json.firstCall.args[0];
      const matches = response.fixtures[0].matches;
      
      // Partido futuro
      expect(matches[0].is_upcoming).to.be.true;
      expect(matches[0].hours_until_start).to.be.at.least(4);
      
      // Partido pasado
      expect(matches[1].is_upcoming).to.be.false;
      expect(matches[1].hours_until_start).to.be.null;
    });

    it('debería incluir resultados en partidos jugados', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      const mockTournament = { id: 100, name: 'Apertura', penca_id: 10, status: 'active' };
      const mockFixtures = [
        {
          id: 1,
          name: 'Fecha 1',
          number: 1,
          Matches: [
            {
              id: 1,
              match_datetime: new Date('2026-03-20T18:00:00'),
              status: 'jugado',
              home_goals: 3,
              away_goals: 2,
              homeTeam: { id: 1, name: 'Nacional', logo_url: null },
              awayTeam: { id: 2, name: 'Peñarol', logo_url: null },
            },
          ],
        },
      ];

      sinon.stub(Tournament, 'findOne').resolves(mockTournament);
      sinon.stub(Fixture, 'findAll').resolves(mockFixtures);

      await getCalendar(req, res);

      const response = res.json.firstCall.args[0];
      const match = response.fixtures[0].matches[0];
      
      expect(match.status).to.equal('jugado');
      expect(match.home_goals).to.equal(3);
      expect(match.away_goals).to.equal(2);
    });

    it('debería manejar errores de base de datos', async () => {
      const req = {
        user: { userId: 1, pencaId: 10, role: 'player' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
      };

      sinon.stub(Tournament, 'findOne').rejects(new Error('Database error'));

      await getCalendar(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('error');
    });
  });
});
