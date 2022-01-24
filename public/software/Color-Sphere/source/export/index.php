<?php

/*

	Export Media : 0.1 : colrd.com
	------------------------------------------------------
	TYPE  = aco/ase/ai/css/gpl
	DNA   = 005DC4,FFEEA8,B9B7C0
	------------------------------------------------------
	External access;
	------------------------------------------------------
	/export/?dna=005DC4,FFEEA8,B9B7C0
	------------------------------------------------------
	Internal access;
	------------------------------------------------------
	ExportGP(Array(
		"name" => "My Color",
		"dna" => "005DC4,FFEEA8,B9B7C0",
		"license" => "CC0"
	))

*/

class ExportGP {
	public $hex;
	private $detail;
	private $space;
	private $mime = Array(
		"pdf"=>"application/pdf",
		"exe"=>"application/octet-stream",
		"zip"=>"application/zip",
		"doc"=>"application/msword",
		"xls"=>"application/vnd.ms-excel",
		"ppt"=>"application/vnd.ms-powerpoint",
		"gif"=>"image/gif",
		"png"=>"image/png",
		"jpeg"=>"image/jpg",
		"jpg"=>"image/jpg"	
	);

	public function __construct($detail) {
		$this->detail = $detail;
		$this->space = new ColorSpace;
		$this->hex = explode(',', $detail['dna']); //$stripData = true
		// ensure hex is formatted 16 bit (remove leading FF)
		foreach($this->hex as &$h) {
			$h = (strlen($h) === 8)  ?  substr($h, 2)  :  $h;
		}
	}

	private function fileHeaders($type) {
		$ctype = $mime[$type];
		if (!$ctype) $ctype = "application/force-download";
		header("Pragma: public"); // required
		header("Expires: 0");
		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header("Content-Type: {$ctype}");
		header('Content-Disposition: attachment; filename="' . $this->detail['name'] . ".{$type}\"");
		header("Content-Transfer-Encoding: binary");
	}
	
	public function aco() {
		$this->fileHeaders('aco');
		$aco = new ExportTypeACO;
		foreach ($this->hex as $h) {
			$rgb = $this->space->HEX_RGB($this->space->STRING_HEX($h));
			$aco->add("", $rgb['R'], $rgb['G'], $rgb['B']);
		}
    	$aco->outputAcofile();
    	exit();
	}	
	
	public function ai() {	
		$this->fileHeaders('ai');
		foreach ($this->hex as $h) {
			$rgb = $this->space->HEX_RGB($this->space->STRING_HEX($h));
			$swatch .= "\n" . ($rgb['R'] / 255) . " " . ($rgb['G'] / 255) . " " . ($rgb['B'] / 255) . " Xa\nPc";
        }
        echo <<<X
%!PS-Adobe-3.0
%%Creator: Adobe Illustrator(r) 6.0
%%For: ({$username}) (ColRD.com)
%%Title: ({$filename})
%%CreationDate: ({$dt}) ({$tm})
%%BoundingBox: 0 0 0 0
%%HiResBoundingBox: 0 0 0 0
%%DocumentProcessColors:
%AI5_FileFormat 2.0
%AI3_ColorUsage: Color
%AI5_ArtSize: 612 792
%AI5_RulerUnits: 2
%AI5_ArtFlags: 1 0 0 1 0 0 0 1 0
%AI5_TargetResolution: 800
%AI5_NumLayers: 1
%AI3_DocumentPreview: None
%%EndComments
%%BeginProlog
%%EndProlog
%%BeginSetup
%AI5_BeginPalette
0 0 Pb
{$swatch}
PB
%AI5_EndPalette
%%EndSetup
%%Trailer
%%EOF
X;
		exit;
	}

	public function css() {
        foreach ($this->hex as $h) {
            echo "<div style=\"padding: 10px; background:#{$h};\">
					<code>#{$h}</code></div>\n";
        }


// 		$plural['color'] = pluralize(count($this->hex),'Color');

//         foreach ($this->hex as $h) {
//             $hex .= "<li>
//             			<span class=\"element\">
// 							<span class=\"primitive $browse->contentType\" style=\"background:#{$h};\"></span>
// 						</span>
// 						<code>#{$h}</code></li>\n";
//         }
// 
//         foreach ($this->hex as $h) {
//             $rgb = $this->space->HEX_RGB($this->space->STRING_HEX($h));
//             $rgbOut .= "<li>
// 							<span class=\"element\">
// 								<span class=\"primitive $browse->contentType\" style=\"background: rgb($rgb[R],$rgb[G],$rgb[B]);\"></span>
// 							</span>
// 							<code>RGB($rgb[R], $rgb[G], $rgb[B])</code></li>\n";
//         }
// 
//         foreach ($this->hex as $h) {
// 			$hsl = $this->space->RGB_HSL($this->space->HEX_RGB($this->space->STRING_HEX($h)));
// 			$css = "HSL(".round($hsl[H]).", ".round($hsl[S],1)."%, ".round($hsl[L],1)."%)";
// 			$hslOut .= "<li>
// 						<span class=\"element\">
// 							<span class=\"primitive $browse->contentType\" style=\"background: $css\"></span>
// 						</span>
// 						<code>$css</code></li>\n";
//         }
// 
// 		return <<<X
// 		<div class="codeSheet">
// 			<ol>
// 				<li><h2>HEX {$plural['color']}:</h2></li>
// 				$hex
// 			</ol>
// 			<ol>
// 				<li><h2>RGB {$plural['color']}:</h2></li>
// 				$rgbOut
// 			</ol>
// 			<ol>
// 				<li><h2>HSL</h2></li>
// 				$hslOut
// 			</ol>
// 			<br class="clear" />
// 		</div>
// X;
	}
	
	public function ase() {
		$this->fileHeaders('ase');
		$ase = new ExportTypeASE;
		$ase->load($this->hex);
		echo $ase->mkASE();
		exit;
	}
	
	public function gpl() {
		$this->fileHeaders('gpl');
		echo <<<X
GIMP Palette
Name: {$filename}
Columns: 4
#
X;
		//171 164 136 Effect
		function getFormated($value) {
			$value = round($value);
			while (strlen($value) < 3) $value = " " . $value;
			return $value;
		}
		foreach ($this->hex as $h) {
			$rgb = $this->space->HEX_RGB($this->space->STRING_HEX($h));
			echo "\n" . getFormated($rgb['R']) . " " . getFormated($rgb['G']) . " " . getFormated($rgb['B']) . "\tUntitled";
		}
		exit;
	}
	
	public function zip() {
		GLOBAL $b;
		$attribution = $this->detail->license;
		$files[] = $b->libDir.$this->detail->dna;
		if($attribution === 'Gaudi') {
			$files[] = $b->libDir.'licenses/README-gaudi.txt';
		}
		$outFile = $b->incDir."compiled/$attribution-{$this->detail['name']}.zip";
		$this->createZip($files, $outFile);
		if(is_file($outFile)) {
			$this->fileHeaders('zip');
			header("Content-Length: ".filesize($outFile));
			readfile($outFile);
		} else {
			ResponseCode::notfound();
		}
	}

	public function img() {
		GLOBAL $b;
		$dna = $this->detail->dna;
		$dir = dirname($dna);
		list($name, $ext) = explode('.', basename($dna));
		$this->fileHeaders($ext);
		header("Content-Length: ".filesize($b->libDir.$dna));
		readfile($b->libUrl.$dna);
	}

	// CREATE A COMPRESSED ZIP FILE
	private function createZip($files=array(), $destination='', $overwrite=false) {
		// if the zip file already exists and overwrite is false, return false
		if(file_exists($destination) && !$overwrite) { return false; }

		// make sure the files exists				
		$valid_files = array();
		if(is_array($files)) {
			foreach($files as $file) {
				if(file_exists($file)) {
					$valid_files[] = $file;
				}
			}
		}

		// if we have good files...
		if(count($valid_files)) {
			//create the archive
			$zip = new ZipArchive();
			if($zip->open($destination,$overwrite ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE) !== true)
				return false;
			foreach($valid_files as $file) {
				$zip->addFile($file, basename($file));
			}
			$zip->close();
			
			//check to make sure the file exists
			return file_exists($destination);
			
		} else {
			return false;
		}
	}
}

if (!isset($_GET['dna'])) exit;

include("./ExportTypeACO.php");
include("./ExportTypeASE.php");
include("./ColorSpace.php");

$export = new ExportGP(Array(
	"name"=>"My Color",
	"dna"=>$_GET['dna'],
	"license"=>"CC0"
));
$type = $_GET['type'];
if (!$type) $type = "gpl";
switch($type) {
	case 'ai':  $export->ai();  break;
	case 'aco': $export->aco(); break;
	case 'ase': $export->ase(); break;
	case 'gpl': $export->gpl(); break;
	//- detangle these from ColRD
	case 'img': $export->img(); break;
	case 'zip': $export->zip(); break;
	case 'css':
		$css = $export->css();				
// 		$plural['code'] = pluralize(count($export->hex),'Code');
// 		$type = ucwords($browse->contentType);
// 		$z->pageTitle = "HTML/CSS Color {$plural['code']} For {$browse->getName()}";
// 		$z->bodyID = 'discover';
// 		$z->bodyClass = 'download full css';
// 		$h1 = "HTML/CSS Color {$plural['code']} For {$browse->getName()}";
// 		$main_content = <<<X
// 			<a href="{$_SERVER['SCRIPT_NAME']}" class="button" id="back"><span>Back To $type Page</span></a>
// 			$css
// X;
		break;
}

?>