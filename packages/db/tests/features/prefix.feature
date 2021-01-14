Feature: Prefix
  It should be possible to set a prefix for the database
  that would get prepended to every key.

  Scenario Outline: Prefixes for keys
    Given database containing
      | Key          | Value |
      | users:1      | john  |
      | users:acme   | 123   |
      | users:van:1  | mike  |
    When I use "users" as a prefix
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key   | Value |
      | 1     | john  |
      | acme  | 123   |
      | van:1 | mike  |

  Scenario Outline: Store & retrive under a prefix
    Given database containing
      | Key          | Value |
      | users:1      | john  |
      | users:acme   | 123   |
      | users:van:1  | mike  |
    When I use "users" as a prefix
    And I use "van" as a prefix
    And I store 2=pete in the database
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key   | Value |
      | 1     | mike  |
      | 2     | pete  |

  Scenario Outline: Store & retrive under a prefix
    Given database containing
      | Key          | Value |
      | users:1      | john  |
      | users:acme   | 123   |
      | users:van:1  | mike  |
    When I use "users" as a prefix
    And I use "van" as a prefix
    And I store 2=pete in the database
    And I unprefix twice
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key         | Value |
      | users:van:1 | mike  |
      | users:van:2 | pete  |

  Scenario Outline: Arrays for keys
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    When I use "users" as a prefix
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key      | Value |
      | 1        | john  |
      | acme     | 123   |
      | [van, 1] | mike  |

  Scenario Outline: Nested prefixes for keys
    Given database containing
      | Key          | Value |
      | users:1      | john  |
      | users:acme   | 123   |
      | users:van:1  | mike  |
      | users:van:2  | pete  |
    When I use "users" as a prefix
    And I use "van" as a prefix
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key   | Value |
      | 1     | mike  |
      | 2     | pete  |

  Scenario Outline: Unprefix keys once
    Given database containing
      | Key          | Value |
      | users:1      | john  |
      | users:acme   | 123   |
      | users:van:1  | mike  |
      | users:van:2  | pete  |
    When I use "users" as a prefix
    And I use "van" as a prefix
    And I unprefix once
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key   | Value |
      | van:1 | mike  |
      | van:2 | pete  |

  Scenario Outline: Unprefix keys multiple times
    Given database containing
      | Key          | Value |
      | users:1      | john  |
      | users:acme   | 123   |
      | users:van:1  | mike  |
      | users:van:2  | pete  |
    When I use "users" as a prefix
    And I use "van" as a prefix
    And I unprefix twice
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key         | Value |
      | users:van:1 | mike  |
      | users:van:2 | pete  |
