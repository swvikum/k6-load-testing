--use below query to retrieve data
--save in data file. 
--Old MatchIds which are not cached.
SELECT
  DISTINCT LOWER(m.MatchGuid) AS MatchGuid,
  m.StartDateTime AS StartDateTime
FROM
  app.Match AS m
  JOIN app.Round AS r ON m.RoundGuid = r.RoundGuid
  JOIN ref.Grade AS g ON r.GradeGuid = g.GradeGuid
  JOIN app.MatchTeam AS mt ON m.MatchGuid = mt.MatchGuid
  JOIN ref.Team AS t ON mt.TeamGuid = t.TeamGuid
  JOIN app.MatchPlayer as mp ON mp.MatchTeamId = mt.MatchTeamId
WHERE  m.StartDateTime >=  GETDATE()- 90 and m.StartDateTime <=  GETDATE()- 30 and 
  g.PlayHQGradeId not in (
    '3a9929f7-3549-449d-9b32-85eb48a9fb6c',
    '27e52038-77a7-4cc3-a4de-783169525195',
    '46da7f97-b399-4bca-be87-eef9d8fa0503',
    'fe65755b-fe06-4348-bb14-a51b05297125',
    'd368f5d3-9230-4af2-b9c1-9c2d9918725c',
    '131a3a55-d7fa-4a48-95bf-8dc323407ee4',
    '809fdab4-ccdb-4d2b-9034-27d388fa10f5',
    'ca975b2d-ce0a-4fcb-aa27-7d252010e82e',
    '45815d56-4cb9-4df1-898a-0453a42d3fa5',
    'ab5423c4-0154-4c12-8850-0c433ab31e95',
    '62281485-dccd-4a10-9d0f-5b7ece31cd66',
    'd555229c-9b40-47df-b466-2c512b1a5e40',
    'e2ccbdb3-9e0f-4d49-bc65-5cd6c8d92d14',
    'a97724f3-9045-452b-9c8a-0112a8238915',
    '18655cfe-1be5-4a27-8b6d-929625c69fde',
    'f7d18788-5d09-4364-9760-41a897549cc0',
    'f7d18788-5d09-4364-9760-41a897549cc0',
    'e249749e-c2fd-49d8-b5fc-33b625c0535d',
    '94925c65-315b-4e49-8065-90462031e4cf',
    '8691b754-fbec-45b3-8c80-4116cf50fa8d',
    '140be389-ff71-4c8d-8b01-e3af2fa9e461',
    'ad008d2e-f32b-45ee-8250-55308c05107c',
    'a9985196-7fc0-44f3-8a78-8883461298de',
    'fc692231-baa1-4936-9565-cef89abd2564',
    'bae8a040-802d-45a4-a4d3-096eaecc0a67',
    '79f7505c-551b-4048-9379-85f7f4236524',
    '69c9c4e2-85e1-4b71-8dfd-07bece687ea7' 
  )
  FOR JSON PATH;


  --MatchIds currently live scoring
  SELECT
  DISTINCT LOWER(m.MatchGuid) AS MatchGuid,
  m.StartDateTime AS StartDateTime
FROM
  app.Match AS m
  JOIN app.Round AS r ON m.RoundGuid = r.RoundGuid
  JOIN ref.Grade AS g ON r.GradeGuid = g.GradeGuid
  JOIN app.MatchTeam AS mt ON m.MatchGuid = mt.MatchGuid
  JOIN ref.Team AS t ON mt.TeamGuid = t.TeamGuid
  JOIN app.MatchPlayer as mp ON mp.MatchTeamId = mt.MatchTeamId
WHERE 
  g.PlayHQGradeId in (
    '3a9929f7-3549-449d-9b32-85eb48a9fb6c',
    '27e52038-77a7-4cc3-a4de-783169525195',
    '46da7f97-b399-4bca-be87-eef9d8fa0503',
    'fe65755b-fe06-4348-bb14-a51b05297125',
    'd368f5d3-9230-4af2-b9c1-9c2d9918725c',
    '131a3a55-d7fa-4a48-95bf-8dc323407ee4',
    '809fdab4-ccdb-4d2b-9034-27d388fa10f5',
    'ca975b2d-ce0a-4fcb-aa27-7d252010e82e',
    '45815d56-4cb9-4df1-898a-0453a42d3fa5',
    'ab5423c4-0154-4c12-8850-0c433ab31e95',
    '62281485-dccd-4a10-9d0f-5b7ece31cd66',
    'd555229c-9b40-47df-b466-2c512b1a5e40',
    'e2ccbdb3-9e0f-4d49-bc65-5cd6c8d92d14',
    'a97724f3-9045-452b-9c8a-0112a8238915',
    '18655cfe-1be5-4a27-8b6d-929625c69fde',
    'f7d18788-5d09-4364-9760-41a897549cc0',
    'f7d18788-5d09-4364-9760-41a897549cc0',
    'e249749e-c2fd-49d8-b5fc-33b625c0535d',
    '94925c65-315b-4e49-8065-90462031e4cf',
    '8691b754-fbec-45b3-8c80-4116cf50fa8d',
    '140be389-ff71-4c8d-8b01-e3af2fa9e461',
    'ad008d2e-f32b-45ee-8250-55308c05107c',
    'a9985196-7fc0-44f3-8a78-8883461298de',
    'fc692231-baa1-4936-9565-cef89abd2564',
    'bae8a040-802d-45a4-a4d3-096eaecc0a67',
    '79f7505c-551b-4048-9379-85f7f4236524',
    '69c9c4e2-85e1-4b71-8dfd-07bece687ea7' 
  )
  FOR JSON PATH;