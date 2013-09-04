#module for predicate type constants
module SCAN_TYPE
	EQ = 0
	LT = 1
	GT = 2
	BETWEEN = 3
	COMPOUND = 4
	NEG = 5
	AND = 6
	OR = 7
	NOT = 8
	MULTI_EQ = 9
end

#module for container type constants
module V_TYPE
	INTEGER = 0
	FLOAT = 1
	STRING = 2
end


class SimpleTableScanOperator < Operator
	def initialize()
		super()
		initializeWithType("SimpleTableScan")
		@predicates = Array.new
		@inputs = Array.new
	end

	def addInput(table)
		@inputs << table
	end

	def addPredicate(type=SCAN_TYPE::EQ,in_type=nil,f=nil,vtype=nil,value=nil)
		#build the new predicate
		predicate = {"type"=>type};

		if not in_type.nil?
			predicate["in"] = in_type
		end

		if not f.nil?
			predicate["f"] = f
		end

		if not vtype.nil?
			predicate["vtype"] = vtype
		end

		if not value.nil?
			predicate["value"] = value
		end


		@predicates.push(predicate)
	end

	def as_json(*a)
		{"type"=>@type, "predicates"=>@predicates, "input" => @inputs}
	end

end
