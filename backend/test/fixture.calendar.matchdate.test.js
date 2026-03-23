const { expect } = require('chai');
const sinon = require('sinon');
const { list } = require('../src/controllers/fixture.controller');
const { Fixture } = require('../src/models');

describe('Fixture Controller - list: match_date en calendario', () => {
  afterEach(() => sinon.restore());

  it('debería devolver match_date en cada partido del fixture', async () => {
    const req = { params: { tournamentId: '100' } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    const mockFixtures = [{
      id: 1, name: 'Fecha 1', number: 1,
      Matches: [
        {
          id: 10,
          match_date: new Date('2026-03-25T18:00:00'),
          status: 'scheduled',
          home_score: null, away_score: null,
          homeTeam: { id: 1, name: 'Nacional', logo_url: null },
          awayTeam: { id: 2, name: 'Peñarol', logo_url: null },
        },
        {
          id: 11,
          match_date: new Date('2026-03-26T20:30:00'),
          status: 'scheduled',
          home_score: null, away_score: null,
          homeTeam: { id: 3, name: 'Defensor', logo_url: null },
          awayTeam: { id: 4, name: 'Wanderers', logo_url: null },
        },
      ],
    }];

    sinon.stub(Fixture, 'findAll').resolves(mockFixtures);
    await list(req, res);

    expect(res.json.calledOnce).to.be.true;
    const response = res.json.firstCall.args[0];
    const matches = response.fixtures[0].Matches;

    expect(matches[0]).to.have.property('match_date');
    expect(matches[0].match_date).to.be.instanceOf(Date);
    expect(matches[1]).to.have.property('match_date');
  });

  it('debería devolver match_date null si el partido no tiene fecha asignada', async () => {
    const req = { params: { tournamentId: '100' } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    const mockFixtures = [{
      id: 1, name: 'Fecha 1', number: 1,
      Matches: [{
        id: 10,
        match_date: null,
        status: 'scheduled',
        home_score: null, away_score: null,
        homeTeam: { id: 1, name: 'Nacional', logo_url: null },
        awayTeam: { id: 2, name: 'Peñarol', logo_url: null },
      }],
    }];

    sinon.stub(Fixture, 'findAll').resolves(mockFixtures);
    await list(req, res);

    const response = res.json.firstCall.args[0];
    const match = response.fixtures[0].Matches[0];
    expect(match.match_date).to.be.null;
  });

  it('debería manejar fixtures sin partidos', async () => {
    const req = { params: { tournamentId: '100' } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    const mockFixtures = [{
      id: 1, name: 'Fecha 1', number: 1,
      Matches: [],
    }];

    sinon.stub(Fixture, 'findAll').resolves(mockFixtures);
    await list(req, res);

    const response = res.json.firstCall.args[0];
    expect(response.fixtures[0].Matches).to.have.lengthOf(0);
  });
});
