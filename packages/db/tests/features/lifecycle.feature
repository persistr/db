Feature: Database lifecycle
  It should be possible to create and destroy a database.

  Scenario: By default, an in-memory database is created
    When I create a new database "db2" with default options
    Then the type of "db2" database should be "memory"
