use zed_extension_api::{
	self as zed, LanguageServerId, Result, Worktree, settings::LspSettings,
};

struct WxExtension;

impl zed::Extension for WxExtension {
	fn new() -> Self {
		WxExtension
	}

	fn language_server_command(
		&mut self,
		_language_server_id: &LanguageServerId,
		worktree: &Worktree,
	) -> Result<zed::Command> {
		let binary_settings = LspSettings::for_worktree("wx", worktree)
			.ok()
			.and_then(|settings| settings.binary);

		let command = binary_settings
			.as_ref()
			.and_then(|binary| binary.path.clone())
			.or_else(|| worktree.which("wx"))
			.ok_or_else(|| {
				"wx not found on PATH. Install it with `npm install -g @wx-lang/cli`, build it \
				 from source (https://github.com/wxlanguage/wx#readme), or point at a specific \
				 install with the `lsp.wx.binary.path` setting."
					.to_string()
			})?;

		let args = binary_settings
			.and_then(|binary| binary.arguments)
			.unwrap_or_else(|| vec!["lsp".to_string()]);

		Ok(zed::Command {
			command,
			args,
			env: Default::default(),
		})
	}
}

zed::register_extension!(WxExtension);
