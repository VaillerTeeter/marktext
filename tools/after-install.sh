#!/bin/bash

# 查看默认生成的 postinst 脚本
# dpkg-deb -e build/marktext-amd64.deb /tmp/marktext-control
# cat /tmp/marktext-control/postinst

# 默认生成的 postinst 脚本内容如下：
if type update-alternatives 2>/dev/null >&1; then
    # Remove previous link if it doesn't use update-alternatives
    if [ -L '/usr/bin/marktext' -a -e '/usr/bin/marktext' -a "`readlink '/usr/bin/marktext'`" != '/etc/alternatives/marktext' ]; then
        rm -f '/usr/bin/marktext'
    fi
    update-alternatives --install '/usr/bin/marktext' 'marktext' '/opt/MarkText/marktext' 100 || ln -sf '/opt/MarkText/marktext' '/usr/bin/marktext'
else
    ln -sf '/opt/MarkText/marktext' '/usr/bin/marktext'
fi

# Check if user namespaces are supported by the kernel and working with a quick test:
if ! { [[ -L /proc/self/ns/user ]] && unshare --user true; }; then
    # Use SUID chrome-sandbox only on systems without user namespaces:
    chmod 4755 '/opt/MarkText/chrome-sandbox' || true
else
    chmod 0755 '/opt/MarkText/chrome-sandbox' || true
fi

if hash update-mime-database 2>/dev/null; then
    update-mime-database /usr/share/mime || true
fi

if hash update-desktop-database 2>/dev/null; then
    update-desktop-database /usr/share/applications || true
fi

# 设置 chrome-sandbox SUID 权限（关键）
if [ -f /opt/MarkText/chrome-sandbox ]; then
    chown root:root /opt/MarkText/chrome-sandbox
    chmod 4755 /opt/MarkText/chrome-sandbox
fi
