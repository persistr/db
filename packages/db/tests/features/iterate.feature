Feature: Iterate on key-value pairs
  It should be possible to iterate on key-value pairs and
  retrieve them in sorted order.

  Scenario: Iterate on entire database
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
      | [users, van, 2] | pete  |
    Then iterating should return
      | Key         | Value |
      | users:1     | john  |
      | users:acme  | 123   |
      | users:van:1 | mike  |
      | users:van:2 | pete  |

  Scenario: Decode keys while iterating
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
      | [users, van, 2] | pete  |
    Then decoding keys while iterating on prefix "users:van" should return
      | Key             | Value |
      | [users, van, 1] | mike  |
      | [users, van, 2] | pete  |

  Scenario: Iterate on part of database
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
      | [users, van, 2] | pete  |
    Then iterating on prefix "users:van" should return
      | Key         | Value |
      | users:van:1 | mike  |
      | users:van:2 | pete  |

  Scenario: Iterate on part of database with a limit
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
      | [users, van, 2] | pete  |
    Then iterating on prefix "users:van" with a limit of 1 should return
      | Key         | Value |
      | users:van:1 | mike  |

  Scenario: Iterate on part of database with a limit
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
      | [users, van, 2] | pete  |
    Then iterating on prefix "users" with a limit of 2 should return
      | Key        | Value |
      | users:1    | john  |
      | users:acme | 123   |

  Scenario: Iterate on keys only
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
      | [users, van, 2] | pete  |
    Then iterating keys should return
      | Key         |
      | users:1     |
      | users:acme  |
      | users:van:1 |
      | users:van:2 |

  Scenario: Iterate on values only
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
      | [users, van, 2] | pete  |
    Then iterating values should return
      | Value |
      | john  |
      | 123   |
      | mike  |
      | pete  |
