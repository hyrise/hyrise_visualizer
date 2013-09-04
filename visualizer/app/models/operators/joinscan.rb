module CONDITION_TYPE
	AND = 0
	OR = 1
	NOT = 2
	EXP_EQ = 3
end

class JoinScanOperator < Operator

	def initialize
		super
		@predicates = Array.new
		initializeWithType("JoinScan")
	end

	def addPredicate(type, leftTable, leftField, rightTable, rightField)
		@fields << field
	end

	def as_json(*a)
		{"type" => @type, "fields" => @fields, "input" => @inputs}
	end
end
