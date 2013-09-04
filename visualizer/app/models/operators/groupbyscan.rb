class GroupByScanOperator < Operator

	def initialize
		super
		@fields = Array.new
		@functions = Array.new
		initializeWithType("GroupByScan")
	end

	def addFunction(type, field) 
		@functions << {"type" => type, "field" => field}
	end

	def addField(field)
		@fields << field
	end

	def as_json(*a)
		{"type" => @type, "fields" => @fields, "functions" => @functions}
	end

end
