'use client'

import Link from 'next/link'
import { Facebook, Instagram, Youtube, MessageCircle, Phone, Mail, MapPin } from 'lucide-react'

interface SocialLinks {
    line?: string
    facebook?: string
    threads?: string
    instagram?: string
    youtube?: string
}

interface FooterSettings {
    socialLinks?: SocialLinks
    about?: string
    contact?: string
    email?: string
    phone?: string
    address?: string
    copyright?: string
}

interface Props {
    storeName: string
    storeSlug: string
    settings?: FooterSettings
}

export function StoreFooter({ storeName, storeSlug, settings = {} }: Props) {
    const {
        socialLinks = {},
        about,
        contact,
        email,
        phone,
        address,
        copyright
    } = settings

    // 如果沒有任何設定，顯示簡化版
    const hasContent = about || contact || email || phone || address ||
        Object.values(socialLinks).some(link => link)

    return (
        <footer className="border-t bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {hasContent ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* 關於我們 */}
                        {(about || contact) && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">關於我們</h3>
                                {about && <p className="text-sm text-gray-600 mb-2">{about}</p>}
                                {contact && <p className="text-sm text-gray-600">{contact}</p>}
                            </div>
                        )}

                        {/* 聯絡資訊 */}
                        {(email || phone || address) && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">聯絡資訊</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    {email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <a href={`mailto:${email}`} className="hover:text-gray-900">
                                                {email}
                                            </a>
                                        </div>
                                    )}
                                    {phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <a href={`tel:${phone}`} className="hover:text-gray-900">
                                                {phone}
                                            </a>
                                        </div>
                                    )}
                                    {address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span>{address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 社交媒體 */}
                        {Object.values(socialLinks).some(link => link) && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">追蹤我們</h3>
                                <div className="flex gap-3">
                                    {socialLinks.line && (
                                        <a
                                            href={socialLinks.line}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                            aria-label="LINE"
                                        >
                                            <MessageCircle className="h-5 w-5 text-green-600" />
                                        </a>
                                    )}
                                    {socialLinks.facebook && (
                                        <a
                                            href={socialLinks.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                            aria-label="Facebook"
                                        >
                                            <Facebook className="h-5 w-5 text-blue-600" />
                                        </a>
                                    )}
                                    {socialLinks.instagram && (
                                        <a
                                            href={socialLinks.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                            aria-label="Instagram"
                                        >
                                            <Instagram className="h-5 w-5 text-pink-600" />
                                        </a>
                                    )}
                                    {socialLinks.threads && (
                                        <a
                                            href={socialLinks.threads}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                            aria-label="Threads"
                                        >
                                            <MessageCircle className="h-5 w-5 text-gray-900" />
                                        </a>
                                    )}
                                    {socialLinks.youtube && (
                                        <a
                                            href={socialLinks.youtube}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                            aria-label="YouTube"
                                        >
                                            <Youtube className="h-5 w-5 text-red-600" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                {/* 版權資訊 */}
                <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    {copyright || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
                </div>
            </div>
        </footer>
    )
}
