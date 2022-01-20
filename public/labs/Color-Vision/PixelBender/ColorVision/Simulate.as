package ColorVision {
	import flash.display.Shader;
	import flash.filters.ShaderFilter;
	public class Simulate extends ShaderFilter{		
		[Embed(source = "Simulate.pbj", mimeType = "application/octet-stream")]
		private var Filter:Class;		
		public function Simulate():void{ this.shader = new Shader(new Filter()); }
		public function set type(value:Number):void{ shader.data.type.value[0] = value; }
		public function get type():Number{ return shader.data.type.value[0]; }
		public function set amount(value:Number):void{ shader.data.amount.value[0] = value; }
		public function get amount():Number{ return shader.data.amount.value[0]; }
	}
}