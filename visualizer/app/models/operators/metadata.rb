class MetaDataOperator < Operator
	def initialize()
		super()
		initializeWithType("MetaData")
		@inputs = Array.new
	end

	def addInput(tablename) 
		@inputs << tablename
	end

	def as_json(*a)
		{"type"=>@type, "input"=>@inputs}
	end

end
